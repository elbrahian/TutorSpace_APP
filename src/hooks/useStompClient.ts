/**
 * useStompClient.ts — Singleton WebSocket STOMP para TutorSpace
 *
 * Bug 5: Los hooks useWebSocket, useNotificaciones y useChat creaban 3
 * conexiones STOMP independientes. Este módulo expone un cliente único
 * a nivel de módulo (singleton) para toda la sesión del usuario.
 *
 * Uso:
 *   - useWebSocket.ts lo inicializa (llamado desde DashboardLayout o App.tsx)
 *   - useNotificaciones.ts y useChat.ts lo consumen para suscribirse
 */

import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

// ── Singleton a nivel de módulo ───────────────────────────────────────────────
let globalClient: Client | null = null
// Callbacks pendientes de suscripción (registrados antes de que el cliente conecte)
const pendingSubscriptions: Map<string, (msg: any) => void> = new Map()
// Suscripciones activas
const activeSubscriptions: Map<string, { unsubscribe: () => void }> = new Map()

// ── Inicializar / obtener cliente ─────────────────────────────────────────────
export const getOrCreateStompClient = (token: string): Client => {
    if (globalClient?.connected) return globalClient

    // Si ya existe pero no está conectado aún, devolvemos el mismo
    if (globalClient) return globalClient

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

    const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('[STOMP Singleton] Conectado')
            // Procesar suscripciones pendientes
            pendingSubscriptions.forEach((callback, topic) => {
                if (!activeSubscriptions.has(topic)) {
                    const sub = client.subscribe(topic, callback)
                    activeSubscriptions.set(topic, sub)
                }
            })
            pendingSubscriptions.clear()
        },
        onStompError: (frame) => {
            console.error('[STOMP Singleton] Error:', frame.headers['message'])
        },
        onDisconnect: () => {
            console.log('[STOMP Singleton] Desconectado')
        }
    })

    client.activate()
    globalClient = client
    return client
}

// ── Suscribirse a un topic ────────────────────────────────────────────────────
export const stompSubscribe = (topic: string, callback: (msg: any) => void): void => {
    if (activeSubscriptions.has(topic)) return // ya suscrito

    if (globalClient?.connected) {
        const sub = globalClient.subscribe(topic, callback)
        activeSubscriptions.set(topic, sub)
    } else {
        // Encolar para cuando conecte
        pendingSubscriptions.set(topic, callback)
    }
}

// ── Desuscribirse de un topic ─────────────────────────────────────────────────
export const stompUnsubscribe = (topic: string): void => {
    const sub = activeSubscriptions.get(topic)
    if (sub) {
        sub.unsubscribe()
        activeSubscriptions.delete(topic)
    }
    pendingSubscriptions.delete(topic)
}

// ── Destruir cliente (en logout) ──────────────────────────────────────────────
export const destroyStompClient = (): void => {
    activeSubscriptions.forEach(sub => sub.unsubscribe())
    activeSubscriptions.clear()
    pendingSubscriptions.clear()
    if (globalClient) {
        globalClient.deactivate()
        globalClient = null
    }
}
