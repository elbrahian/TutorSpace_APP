import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { notificacionApi } from '../api/notificacionApi'
import { useNotificacionStore } from '../store/notificacionStore'
import { useAuthStore } from '../store/authStore'
import type { Notificacion } from '../types'

export const useNotificaciones = () => {
    const { token, usuario } = useAuthStore()
    const { 
        notificaciones, 
        noLeidas, 
        setTodas, 
        agregar, 
        marcarLeida: marcarStoreLeida,
        marcarTodasLeidas: marcarStoreTodasLeidas
    } = useNotificacionStore()

    const clientRef = useRef<Client | null>(null)

    // Cargar notificaciones
    useEffect(() => {
        if (!token || !usuario) return

        const cargar = async () => {
            try {
                const data = await notificacionApi.getNotificaciones()
                setTodas(data)
            } catch (error) {
                console.error("Error al cargar notificaciones:", error)
            }
        }
        cargar()
    }, [token, usuario?.id])

    // Conectar WebSocket para notificaciones
    useEffect(() => {
        if (!token || !usuario) return

        const client = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                console.log('STOMP (Notificaciones): Conectado')
                
                client.subscribe(`/topic/notificaciones/${usuario.id}`, (msg) => {
                    try {
                        const notif: Notificacion = JSON.parse(msg.body)
                        agregar(notif)
                    } catch (e) {
                        console.error("Error procesando notificación", e)
                    }
                })
            },
            onStompError: (frame) => {
                console.error('Broker reported error (Notificaciones): ' + frame.headers['message'])
            }
        })

        client.activate()
        clientRef.current = client

        return () => {
            client.deactivate()
        }
    }, [token, usuario?.id])

    const marcarLeida = async (id: number) => {
        // Optimistic update
        marcarStoreLeida(id)
        try {
            await notificacionApi.marcarLeida(id)
        } catch (error) {
            console.error("Error al marcar como leída:", error)
        }
    }

    const marcarTodasLeidas = async () => {
        const noLeidasList = notificaciones.filter(n => !n.leida)
        if (noLeidasList.length === 0) return

        marcarStoreTodasLeidas()
        try {
            await Promise.all(noLeidasList.map(n => notificacionApi.marcarLeida(n.id)))
        } catch (error) {
            console.error("Error al marcar todas como leídas:", error)
        }
    }

    return {
        notificaciones,
        noLeidas,
        marcarLeida,
        marcarTodasLeidas
    }
}
