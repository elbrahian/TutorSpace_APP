import { create } from 'zustand'
import type { Notificacion } from '../types'

interface NotificacionState {
    notificaciones: Notificacion[]
    noLeidas: number
    setTodas: (notificaciones: Notificacion[]) => void
    agregar: (n: Notificacion) => void
    marcarLeida: (id: number) => void
    marcarTodasLeidas: () => void
    limpiar: () => void
}

export const useNotificacionStore = create<NotificacionState>((set) => ({
    notificaciones: [],
    noLeidas: 0,

    setTodas: (notificaciones) => set({ 
        notificaciones, 
        noLeidas: notificaciones.filter(n => !n.leida).length 
    }),

    agregar: (notificacion) => set((state) => {
        // Evitir duplicados
        if (state.notificaciones.some(n => n.id === notificacion.id)) {
            return state
        }
        const nuevas = [notificacion, ...state.notificaciones]
        return {
            notificaciones: nuevas,
            noLeidas: nuevas.filter(n => !n.leida).length
        }
    }),

    marcarLeida: (id) => set((state) => {
        const nuevas = state.notificaciones.map(n => 
            n.id === id ? { ...n, leida: true } : n
        )
        return {
            notificaciones: nuevas,
            noLeidas: nuevas.filter(n => !n.leida).length
        }
    }),

    marcarTodasLeidas: () => set((state) => {
        const nuevas = state.notificaciones.map(n => ({ ...n, leida: true }))
        return {
            notificaciones: nuevas,
            noLeidas: 0
        }
    }),

    limpiar: () => set({ notificaciones: [], noLeidas: 0 })
}))
