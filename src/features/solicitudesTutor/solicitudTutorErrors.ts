import { isAxiosError } from 'axios'

type ApiErrorData = {
    error?: string
    message?: string
    materiaIds?: string
    justificacion?: string
}

const obtenerDetalle = (data: ApiErrorData | string | undefined): string | null => {
    if (typeof data === 'string') return data
    if (!data) return null

    return data.error
        ?? data.message
        ?? data.materiaIds
        ?? data.justificacion
        ?? null
}

export const esSolicitudTutorDuplicada = (error: unknown): boolean => {
    if (!isAxiosError<ApiErrorData | string>(error)) return false

    const detalle = obtenerDetalle(error.response?.data)?.toLowerCase() ?? ''
    return error.response?.status === 409
        || detalle.includes('ya existe una solicitud')
}

export const obtenerMensajeSolicitudTutor = (
    error: unknown,
    fallback: string
): string => {
    if (!isAxiosError<ApiErrorData | string>(error)) return fallback

    const status = error.response?.status
    const detalle = obtenerDetalle(error.response?.data)

    if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'
    if (status === 403) return 'No tienes permisos para realizar esta acción.'
    if (status === 409) return detalle ?? 'La solicitud entra en conflicto con una solicitud existente.'
    if (status === 400) return detalle ?? 'Revisa la información enviada.'

    return detalle ?? fallback
}
