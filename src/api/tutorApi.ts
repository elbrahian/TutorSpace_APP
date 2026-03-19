import axiosInstance from './axiosInstance'
import type { TutorResponse, MateriaResponse, DisponibilidadResponse } from '../types'

export const tutorApi = {
    getTutores: async (): Promise<TutorResponse[]> => {
        const response = await axiosInstance.get('/admin/tutores')
        return response.data
    },

    getMaterias: async (): Promise<MateriaResponse[]> => {
        const response = await axiosInstance.get('/admin/materias')
        return response.data
    },

    createTutor: async (data: any): Promise<TutorResponse> => {
        const response = await axiosInstance.post('/admin/tutores', data)
        return response.data
    },

    activarTutor: async (id: number): Promise<TutorResponse> => {
        const response = await axiosInstance.patch(`/admin/tutores/${id}/activar`)
        return response.data
    },

    desactivarTutor: async (id: number): Promise<TutorResponse> => {
        const response = await axiosInstance.patch(`/admin/tutores/${id}/desactivar`)
        return response.data
    },

    editarJornada: async (id: number, jornadaGeneral: string): Promise<TutorResponse> => {
        const response = await axiosInstance.patch(`/admin/tutores/${id}/jornada`, { jornadaGeneral })
        return response.data
    },

    createMateria: async (data: any): Promise<MateriaResponse> => {
        const response = await axiosInstance.post('/admin/materias', data)
        return response.data
    },

    asignarMateria: async (tutorId: number, materiaId: number): Promise<void> => {
        await axiosInstance.post(`/admin/tutores/${tutorId}/materias`, { materiaId })
    },

    quitarMateria: async (tutorId: number, materiaId: number): Promise<void> => {
        await axiosInstance.delete(`/admin/tutores/${tutorId}/materias/${materiaId}`)
    },

    getDisponibilidad: async (): Promise<DisponibilidadResponse[]> => {
        const response = await axiosInstance.get('/tutor/disponibilidad')
        return response.data
    },

    crearDisponibilidad: async (data: { dia: string, horaInicio: string, horaFin: string }): Promise<DisponibilidadResponse> => {
        const response = await axiosInstance.post('/tutor/disponibilidad', data)
        return response.data
    },

    eliminarDisponibilidad: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/tutor/disponibilidad/${id}`)
    }
}
