import axiosInstance from './axiosInstance'
import type { DisponibilidadResponse, SesionResponse, EstadoSesion, EvaluacionEstudianteRequest, EvaluacionEstudianteResponse } from '../types'

export const sesionApi = {
    getDisponibilidadTutor: async (): Promise<DisponibilidadResponse[]> => {
        const response = await axiosInstance.get('/tutor/disponibilidad')
        return response.data
    },

    crearSesion: async (data: {
        estudianteId: number
        disponibilidadId: number
        fecha: string
        horaInicio: string
        horaFin: string
    }): Promise<SesionResponse> => {
        const response = await axiosInstance.post('/sesiones', data)
        return response.data
    },

    getSesionesTutor: async (): Promise<SesionResponse[]> => {
        const response = await axiosInstance.get('/sesiones/tutor')
        return response.data
    },

    getSesionesEstudiante: async (): Promise<SesionResponse[]> => {
        const response = await axiosInstance.get('/sesiones/estudiante')
        return response.data
    },

    cambiarEstado: async (id: number, nuevoEstado: EstadoSesion): Promise<SesionResponse> => {
        const response = await axiosInstance.patch(`/sesiones/${id}/estado`, { nuevoEstado })
        return response.data
    },

    evaluarEstudiante: async (id: number, data: EvaluacionEstudianteRequest): Promise<EvaluacionEstudianteResponse> => {
        const response = await axiosInstance.post(`/sesiones/${id}/evaluacion-estudiante`, data)
        return response.data
    }
}
