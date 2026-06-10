import axiosInstance from './axiosInstance'

interface AuditoriaParams {
    estadoAnterior?: string
    estadoNuevo?: string
    tutor?: string
    estudiante?: string
    fechaInicio?: string
    fechaFin?: string
    page?: number
    size?: number
}

export const auditoriaApi = {

    getAuditoriaSesiones: async (
        params: AuditoriaParams
    ) => {

        const response = await axiosInstance.get(
            '/admin/auditoria/sesiones',
            {
                params
            }
        )

        return response.data
    }
}