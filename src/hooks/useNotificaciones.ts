/**
 * useNotificaciones.ts
 *
 * Bug 5: Eliminado el bloque que creaba un Client STOMP propio.
 * Ahora usa stompSubscribe/stompUnsubscribe del singleton para suscribirse
 * al topic de notificaciones del usuario actual.
 */

import { useEffect } from 'react'
import { notificacionApi } from '../api/notificacionApi'
import { useNotificacionStore } from '../store/notificacionStore'
import { useAuthStore } from '../store/authStore'
import { stompSubscribe, stompUnsubscribe } from './useStompClient'
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

    // Cargar notificaciones históricas desde la API
    useEffect(() => {
        if (!token || !usuario) return

        const cargar = async () => {
            try {
                const data = await notificacionApi.getNotificaciones()
                setTodas(data)
            } catch (error) {
                console.error('Error al cargar notificaciones:', error)
            }
        }
        cargar()
    }, [token, usuario?.id])

    // Bug 5: Suscribirse al topic via singleton — no crea un Client nuevo
    useEffect(() => {
        if (!token || !usuario) return

        const topic = `/topic/notificaciones/${usuario.id}`

        stompSubscribe(topic, (msg: any) => {
            try {
                const notif: Notificacion = JSON.parse(msg.body)
                agregar(notif)
            } catch (e) {
                console.error('Error procesando notificación', e)
            }
        })

        return () => {
            stompUnsubscribe(topic)
        }
    }, [token, usuario?.id])

    const marcarLeida = async (id: number) => {
        marcarStoreLeida(id)
        try {
            await notificacionApi.marcarLeida(id)
        } catch (error) {
            console.error('Error al marcar como leída:', error)
        }
    }

    const marcarTodasLeidas = async () => {
        const noLeidasList = notificaciones.filter(n => !n.leida)
        if (noLeidasList.length === 0) return

        marcarStoreTodasLeidas()
        try {
            await Promise.all(noLeidasList.map(n => notificacionApi.marcarLeida(n.id)))
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error)
        }
    }

    return {
        notificaciones,
        noLeidas,
        marcarLeida,
        marcarTodasLeidas
    }
}
