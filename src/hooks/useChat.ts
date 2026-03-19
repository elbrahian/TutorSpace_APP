import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { chatApi } from '../api/chatApi'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import type { ChatResponse, MensajeResponse } from '../types'

export const useChat = () => {
    const { token, usuario } = useAuthStore()
    const { 
        chats, chatActivo, mensajes, cargando,
        setChats, setChatActivo, setMensajes, agregarMensaje, setCargando 
    } = useChatStore()
    
    const clientRef = useRef<Client | null>(null)
    const subscriptionRef = useRef<any>(null)

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
            await cargarChats() // refresh
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
            console.error('Error detallado de Spring Boot al enviar mensaje:', error.response?.data || error)
        }
    }

    // Getter para el nombre del chat
    const getNombreChat = (chat: ChatResponse) => {
        return usuario?.rol === 'ESTUDIANTE' ? chat.nombreTutor : chat.nombreEstudiante
    }

    // Conectar WS
    useEffect(() => {
        if (!token) return

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                console.log('STOMP: Conectado')
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message'])
                console.error('Additional details: ' + frame.body)
            }
        })

        client.activate()
        clientRef.current = client

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
            }
            client.deactivate()
        }
    }, [token])

    // Manejar cambios en chat activo
    useEffect(() => {
        if (!chatActivo) {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
                subscriptionRef.current = null
            }
            return
        }

        const cargarMensajes = async () => {
            try {
                setCargando(true)
                const resp = await chatApi.getMensajes(chatActivo.id)
                // Asegurar que los mensajes se muestren en orden cronológico 
                // (antiguos arriba, nuevos abajo)
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

        // Suscribirse si el websocket ya está conectado
        const suscribirse = () => {
            if (!clientRef.current?.connected) {
                // Si aún no está conectado, reintentar en breve
                setTimeout(suscribirse, 500)
                return
            }
            
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
            }

            subscriptionRef.current = clientRef.current.subscribe(
                `/topic/chat/${chatActivo.id}`,
                (mensajeStomp) => {
                    const mensajeBody: MensajeResponse = JSON.parse(mensajeStomp.body)
                    agregarMensaje(mensajeBody)
                }
            )
        }

        suscribirse()

    }, [chatActivo, clientRef.current?.connected])

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
