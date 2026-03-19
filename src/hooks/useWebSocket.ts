import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '../store/authStore'
import { useNotificacionStore } from '../store/notificacionStore'
import { useChatStore } from '../store/chatStore'
import type { Notificacion, MensajeResponse } from '../types'

export const useWebSocket = () => {
    const token = useAuthStore(state => state.token)
    const usuario = useAuthStore(state => state.usuario)
    const chatActivo = useChatStore(state => state.chatActivo)

    const agregarNotificacion = useNotificacionStore(state => state.agregar)
    const agregarMensaje = useChatStore(state => state.agregarMensaje)

    const clientRef = useRef<Client | null>(null)

    useEffect(() => {
        if (!token || !usuario) return

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                // Suscripción a notificaciones
                client.subscribe(`/topic/notificaciones/${usuario.id}`, (message) => {
                    const notificacion: Notificacion = JSON.parse(message.body)
                    agregarNotificacion(notificacion)
                })

                // Suscripción al chat activo si existe
                if (chatActivo) {
                    client.subscribe(`/topic/chat/${chatActivo.id}`, (message) => {
                        const nuevoMensaje: MensajeResponse = JSON.parse(message.body)
                        agregarMensaje(nuevoMensaje)
                    })
                }
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        })

        client.activate()
        clientRef.current = client

        return () => {
            client.deactivate()
        }
    }, [token, usuario, chatActivo, agregarNotificacion, agregarMensaje])

    return clientRef.current
}
