/**
 * useChat.ts
 *
 * Bug 5: Eliminado el bloque que creaba un Client STOMP propio.
 *        Ahora usa stompSubscribe/stompUnsubscribe del singleton.
 *
 * Bug 6: El estado 'stompConnected' se mantiene para garantizar que la
 *        suscripción al chat activo ocurra sólo cuando el cliente esté listo,
 *        sin necesidad del setTimeout recursivo previo.
 *        El singleton expone un callback onReady para notificar al hook.
 */

import { useEffect, useRef, useState } from 'react'
import { chatApi } from '../api/chatApi'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { stompSubscribe, stompUnsubscribe, getOrCreateStompClient } from './useStompClient'
import type { ChatResponse, MensajeResponse } from '../types'

const parsearError = (error: any, accion: string): string => {
    const serverMsg = error?.response?.data?.message
    if (serverMsg) return serverMsg
    const status = error?.response?.status
    if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    if (status === 403) return `No tienes permiso para ${accion}.`
    if (status === 404) return 'El recurso solicitado no existe.'
    if (status === 409) return 'Ya existe una conversación con este tutor.'
    if (status >= 500) return 'Error en el servidor. Intenta de nuevo en unos momentos.'
    if (!navigator.onLine) return 'Sin conexión a internet. Verifica tu red.'
    return `No se pudo ${accion}. Intenta de nuevo.`
}

export const useChat = () => {
    const { token, usuario } = useAuthStore()
    const {
        chats, chatActivo, mensajes, cargando,
        setChats, setChatActivo, setMensajes, agregarMensaje, setCargando
    } = useChatStore()

    // Bug 6: Estado reactivo para saber cuándo el singleton está conectado
    const [stompConnected, setStompConnected] = useState(false)
    // Referencia al topic activo para limpiar al cambiar de chat
    const activeChatTopicRef = useRef<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Cargar mis chats
    const cargarChats = async () => {
        try {
            setError(null)
            const data = await chatApi.getMisChats()
            setChats(data)
        } catch (err) {
            console.error('Error al cargar chats:', err)
            setError(parsearError(err, 'cargar las conversaciones'))
        }
    }

    // Iniciar chat (solo ESTUDIANTE)
    const iniciarChat = async (tutorId: number) => {
        if (usuario?.rol !== 'ESTUDIANTE') return
        try {
            setError(null)
            const resp = await chatApi.iniciarChat(tutorId)
            await cargarChats()
            setChatActivo(resp)
        } catch (err: any) {
            console.error('Error al iniciar chat:', err)
            const msg = parsearError(err, 'iniciar la conversación con este tutor')
            setError(msg)
            throw new Error(msg)
        }
    }

    // Enviar mensaje
    const enviarMensaje = async (contenido: string) => {
        if (!chatActivo) return
        try {
            setError(null)
            await chatApi.enviarMensaje(chatActivo.id, contenido)
            // No lo agregamos manualmente porque lo recibiremos vía WebSocket
        } catch (err: any) {
            console.error('Error al enviar mensaje:', err.response?.data || err)
            setError(parsearError(err, 'enviar el mensaje'))
        }
    }

    // Getter para el nombre del chat
    const getNombreChat = (chat: ChatResponse) => {
        return usuario?.rol === 'ESTUDIANTE' ? chat.nombreTutor : chat.nombreEstudiante
    }

    // Bug 5+6: Inicializar el singleton y monitorear su estado de conexión
    useEffect(() => {
        if (!token || !usuario) return

        const client = getOrCreateStompClient(token)

        // Consultar estado actual (puede que ya esté conectado si useWebSocket lo inició antes)
        if (client.connected) {
            setStompConnected(true)
            return
        }

        // Parcheamos onConnect para detectar la conexión en este hook también
        const originalOnConnect = client.onConnect?.bind(client)
        client.onConnect = (frame) => {
            originalOnConnect?.(frame)
            setStompConnected(true)
        }

        const originalOnDisconnect = client.onDisconnect?.bind(client)
        client.onDisconnect = (frame) => {
            originalOnDisconnect?.(frame)
            setStompConnected(false)
        }

        return () => {
            setStompConnected(false)
        }
    }, [token, usuario?.id])

    // Bug 5+6: Suscribirse al chat activo a través del singleton cuando está conectado
    useEffect(() => {
        if (!chatActivo) {
            // Limpiar suscripción anterior si hay
            if (activeChatTopicRef.current) {
                stompUnsubscribe(activeChatTopicRef.current)
                activeChatTopicRef.current = null
            }
            return
        }

        // Cargar mensajes históricos
        const cargarMensajes = async () => {
            try {
                setError(null)
                setCargando(true)
                const resp = await chatApi.getMensajes(chatActivo.id)
                const ordenados = [...resp.content].sort((a, b) =>
                    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                )
                setMensajes(ordenados)
            } catch (err) {
                console.error('Error cargando mensajes:', err)
                setError(parsearError(err, 'cargar los mensajes de esta conversación'))
            } finally {
                setCargando(false)
            }
        }

        cargarMensajes()

        // Bug 6: Solo suscribirse si el cliente singleton ya está conectado.
        // Si aún no lo está, el efecto se re-ejecutará cuando stompConnected cambie a true.
        if (!stompConnected) return

        const topic = `/topic/chat/${chatActivo.id}`

        // Desuscribir del topic anterior si cambió el chat
        if (activeChatTopicRef.current && activeChatTopicRef.current !== topic) {
            stompUnsubscribe(activeChatTopicRef.current)
        }

        activeChatTopicRef.current = topic

        stompSubscribe(topic, (mensajeStomp: any) => {
            const mensajeBody: MensajeResponse = JSON.parse(mensajeStomp.body)
            agregarMensaje(mensajeBody)
        })

        return () => {
            if (activeChatTopicRef.current) {
                stompUnsubscribe(activeChatTopicRef.current)
                activeChatTopicRef.current = null
            }
        }
    }, [chatActivo, stompConnected]) // Bug 6: stompConnected como dependencia reactiva

    return {
        chats,
        chatActivo,
        mensajes,
        cargando,
        error,
        clearError: () => setError(null),
        cargarChats,
        iniciarChat,
        enviarMensaje,
        setChatActivo,
        getNombreChat
    }
}
