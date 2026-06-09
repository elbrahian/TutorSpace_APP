import axiosInstance from './axiosInstance'
import type { ReporteDesempenoTutorResponse, ReporteDemandaResponse } from '../types'
import type { ReporteDesempenoTutorResponse, ReporteUsoResponse } from '../types'

interface ReporteDesempenoTutoresParams {
    fechaInicio?: string
    fechaFin?: string
}

interface ReporteDemandaParams {
interface ReporteUsoParams {
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
}
    getUsoPorRol: async (params: ReporteUsoParams): Promise<ReporteUsoResponse> => {
        const response = await axiosInstance.get('/admin/reportes/uso', { params })
        return response.data
    }
}
