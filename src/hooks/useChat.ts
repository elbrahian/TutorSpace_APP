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

    // Cargar mis chats
    const cargarChats = async () => {
        try {
            const data = await chatApi.getMisChats()
            setChats(data)
        } catch (error) {
            console.error('Error al cargar chats:', error)
        }
    }

    // Iniciar chat (solo ESTUDIANTE)
    const iniciarChat = async (tutorId: number) => {
        if (usuario?.rol !== 'ESTUDIANTE') return
        try {
            const resp = await chatApi.iniciarChat(tutorId)
            await cargarChats()
            setChatActivo(resp)
        } catch (error) {
            console.error('Error al iniciar chat:', error)
        }
    }

    // Enviar mensaje
    const enviarMensaje = async (contenido: string) => {
        if (!chatActivo) return
        try {
            await chatApi.enviarMensaje(chatActivo.id, contenido)
            // No lo agregamos manualmente porque lo recibiremos vía WebSocket
        } catch (error: any) {
            console.error('Error al enviar mensaje:', error.response?.data || error)
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
                setCargando(true)
                const resp = await chatApi.getMensajes(chatActivo.id)
                const ordenados = [...resp.content].sort((a, b) =>
                    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                )
                setMensajes(ordenados)
            } catch (error) {
                console.error('Error cargando mensajes:', error)
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
        cargarChats,
        iniciarChat,
        enviarMensaje,
        setChatActivo,
        getNombreChat
    }
}
