/**
 * useNotificaciones.ts
 *
 * Bug 5: Eliminado el bloque que creaba un Client STOMP propio.
 * Ahora usa stompSubscribe/stompUnsubscribe del singleton para suscribirse
 * al topic de notificaciones del usuario actual.
 */

import { useEffect, useState } from 'react'
import { notificacionApi } from '../api/notificacionApi'
import { useNotificacionStore } from '../store/notificacionStore'
import { useAuthStore } from '../store/authStore'
import { stompSubscribe, stompUnsubscribe } from './useStompClient'
import type { Notificacion } from '../types'

const parsearError = (error: any, accion: string): string => {
    const serverMsg = error?.response?.data?.message
    if (serverMsg) return serverMsg
    const status = error?.response?.status
    if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    if (status >= 500) return 'Error en el servidor. Intenta de nuevo en unos momentos.'
    if (!navigator.onLine) return 'Sin conexión a internet. Verifica tu red.'
    return `No se pudo ${accion}. Intenta de nuevo.`
}

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

    const [error, setError] = useState<string | null>(null)

    // Cargar notificaciones históricas desde la API
    useEffect(() => {
        if (!token || !usuario) return

        const cargar = async () => {
            try {
                setError(null)
                const data = await notificacionApi.getNotificaciones()
                setTodas(data)
            } catch (err) {
                console.error('Error al cargar notificaciones:', err)
                setError(parsearError(err, 'cargar tus notificaciones'))
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
        } catch (err) {
            console.error('Error al marcar como leída:', err)
            setError(parsearError(err, 'marcar la notificación como leída'))
        }
    }

    const marcarTodasLeidas = async () => {
        const noLeidasList = notificaciones.filter(n => !n.leida)
        if (noLeidasList.length === 0) return

        marcarStoreTodasLeidas()
        try {
            await Promise.all(noLeidasList.map(n => notificacionApi.marcarLeida(n.id)))
        } catch (err) {
            console.error('Error al marcar todas como leídas:', err)
            setError(parsearError(err, 'marcar todas las notificaciones como leídas'))
        }
    }

    return {
        notificaciones,
        noLeidas,
        error,
        clearError: () => setError(null),
        marcarLeida,
        marcarTodasLeidas
    }
}
