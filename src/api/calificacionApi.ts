import axiosInstance from './axiosInstance'
import type { CalificacionSesionRequest, CalificacionSesionResponse } from '../types'

export const calificacionApi = {
    evaluarSesion: async (
        sesionId: number,
        data: CalificacionSesionRequest
    ): Promise<CalificacionSesionResponse> => {
        const response = await axiosInstance.post(`/sesiones/${sesionId}/evaluacion`, data)
        return response.data
    }
}
