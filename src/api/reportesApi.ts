import axiosInstance from './axiosInstance'
import type { ReporteDesempenoTutorResponse } from '../types'

interface ReporteDesempenoTutoresParams {
    fechaInicio?: string
    fechaFin?: string
}

export const reportesApi = {
    getDesempenoTutores: async (params: ReporteDesempenoTutoresParams): Promise<ReporteDesempenoTutorResponse[]> => {
        const response = await axiosInstance.get('/admin/reportes/tutores', { params })
        return response.data
    }
}
