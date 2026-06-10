import { isAxiosError } from 'axios'
import axiosInstance from '../../api/axiosInstance'
import type {
    CrearSolicitudTutorRequest,
    FiltrosSolicitudTutor,
    RevisarSolicitudTutorRequest,
    SolicitudTutorResponse,
} from './types'

type SolicitudesTutorApiResponse =
    | SolicitudTutorResponse[]
    | { content: SolicitudTutorResponse[] }

const normalizarListado = (data: SolicitudesTutorApiResponse): SolicitudTutorResponse[] => {
    return Array.isArray(data) ? data : data.content
}

const normalizarSolicitud = (solicitud: SolicitudTutorResponse): SolicitudTutorResponse => ({
    ...solicitud,
    estado: String(solicitud.estado).trim().toUpperCase() as SolicitudTutorResponse['estado'],
    observaciones: solicitud.observaciones || null,
})

export const solicitudesTutorApi = {
    obtenerMia: async (): Promise<SolicitudTutorResponse | null> => {
        try {
            const response = await axiosInstance.get<SolicitudTutorResponse>('/solicitudes-tutor/mia')
            return normalizarSolicitud(response.data)
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return null
            }
            throw error
        }
    },

    crear: async (data: CrearSolicitudTutorRequest): Promise<SolicitudTutorResponse> => {
        const response = await axiosInstance.post<SolicitudTutorResponse>('/solicitudes-tutor', data)
        return normalizarSolicitud(response.data)
    },

    listar: async (filtros: FiltrosSolicitudTutor = {}): Promise<SolicitudTutorResponse[]> => {
        const params = new URLSearchParams()

        if (filtros.estado) params.set('estado', filtros.estado)
        if (filtros.inicio) params.set('inicio', filtros.inicio)
        if (filtros.fin) params.set('fin', filtros.fin)

        const response = await axiosInstance.get<SolicitudesTutorApiResponse>('/solicitudes-tutor', { params })
        return normalizarListado(response.data)
    },

    revisar: async (
        id: number,
        data: RevisarSolicitudTutorRequest
    ): Promise<SolicitudTutorResponse> => {
        const response = await axiosInstance.patch<SolicitudTutorResponse>(
            `/solicitudes-tutor/${id}/revision`,
            data
        )
        return normalizarSolicitud(response.data)
    },
}
