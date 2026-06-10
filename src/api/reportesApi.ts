import axiosInstance from './axiosInstance'
import type { ReporteCalificacionTutorResponse, ReporteDesempenoTutorResponse, ReporteUsoResponse, ReporteDemandaResponse } from '../types'

interface ReporteDesempenoTutoresParams {
    fechaInicio?: string
    fechaFin?: string
}

interface ReporteDemandaParams {
    fechaInicio?: string
    fechaFin?: string
}

interface ReporteUsoParams {
    fechaInicio?: string
    fechaFin?: string
}

interface ReporteCalificacionesParams {
    fechaInicio?: string
    fechaFin?: string
}

export const reportesApi = {
    getDesempenoTutores: async (params: ReporteDesempenoTutoresParams): Promise<ReporteDesempenoTutorResponse[]> => {
        const response = await axiosInstance.get('/admin/reportes/tutores', { params })
        return response.data
    },

    getDemanda: async (params: ReporteDemandaParams): Promise<ReporteDemandaResponse> => {
        const response = await axiosInstance.get('/admin/reportes/demanda', { params })
        return response.data
    },

    getUsoPorRol: async (params: ReporteUsoParams): Promise<ReporteUsoResponse> => {
        const response = await axiosInstance.get('/admin/reportes/uso', { params })
        return response.data
    },

    getCalificacionesTutores: async (params: ReporteCalificacionesParams): Promise<ReporteCalificacionTutorResponse[]> => {
        const response = await axiosInstance.get('/admin/reportes/calificaciones', { params })
        return response.data
    }
}
