import axiosInstance from './axiosInstance'
import type { MateriaResponse, PageResponse, TutorBusquedaResponse } from '../types'

export const estudianteApi = {
    getMaterias: async (): Promise<MateriaResponse[]> => {
        const response = await axiosInstance.get('/estudiante/materias')
        return response.data
    },

    buscarTutores: async (materiaId: number | '', page: number = 0, size: number = 10): Promise<PageResponse<TutorBusquedaResponse>> => {
        const response = await axiosInstance.get('/estudiante/tutores/buscar', {
            params: { materiaId, page, size }
        })
        return response.data
    }
}
