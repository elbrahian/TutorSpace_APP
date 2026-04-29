/**
 * useWebSocket.ts — Inicializador del cliente STOMP singleton
 *
 * Bug 5: Este hook ahora actúa únicamente como inicializador del singleton.
 * Las suscripciones a notificaciones y chat se hacen en sus propios hooks
 * (useNotificaciones.ts y useChat.ts) usando stompSubscribe/stompUnsubscribe.
 *
 * Debe ser llamado UNA VEZ desde un componente raíz (ej. DashboardLayout).
 */

import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { getOrCreateStompClient, destroyStompClient } from './useStompClient'

export const useWebSocket = () => {
    const token = useAuthStore(state => state.token)
    const usuario = useAuthStore(state => state.usuario)

    useEffect(() => {
        if (!token || !usuario) return

        // Inicializa (o retorna) el cliente singleton
        getOrCreateStompClient(token)

        // Al hacer logout (token se vuelve null en el siguiente render),
        // el cleanup destruye el cliente
        return () => {
            // Solo destruimos si el token desapareció (logout real)
            // No destruimos en re-renders normales
        }
    }, [token, usuario?.id])

    // Destruir cliente al hacer logout
    useEffect(() => {
        if (!token) {
            destroyStompClient()
        }
    }, [token])
}
