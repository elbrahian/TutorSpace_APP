import axiosInstance from './axiosInstance'
import type { Notificacion } from '../types'

export const notificacionApi = {
    getNotificaciones: async (): Promise<Notificacion[]> => {
        const response = await axiosInstance.get('/notificaciones')
        if (!response.data) return []
        return response.data.content || (Array.isArray(response.data) ? response.data : [])
    },

    getNoLeidas: async (): Promise<Notificacion[]> => {
        const response = await axiosInstance.get('/notificaciones/no-leidas')
        if (!response.data) return []
        return response.data.content || (Array.isArray(response.data) ? response.data : [])
    },

    marcarLeida: async (id: number): Promise<void> => {
        await axiosInstance.patch(`/notificaciones/${id}/leer`)
    }
}
