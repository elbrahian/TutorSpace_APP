import axiosInstance from './axiosInstance'
import type { DisponibilidadResponse, SesionResponse, EstadoSesion, EvaluacionEstudianteRequest, EvaluacionEstudianteResponse, PageResponse } from '../types'

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
export interface SesionFiltros {
    estado?: 'PENDIENTE' | 'APROBADA' | 'CANCELADA' | 'COMPLETADA';
    fechaInicio?: string;
    fechaFin?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export const getMisSesionesConFiltros = async (filtros: SesionFiltros): Promise<PageResponse<SesionResponse>> => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    params.append('page', String(filtros.page ?? 0));
    params.append('size', String(filtros.size ?? 10));
    params.append('sort', filtros.sort ?? 'fecha');
    const queryString = params.toString().replace(/%2C/g, ',');

    const response = await axiosInstance.get(`/sesiones?${queryString}`);
    return response.data;
};

export const completarSesion = async (id: number): Promise<SesionResponse> => {
    const response = await axiosInstance.patch(`/sesiones/${id}/completar`);
    return response.data;
};
