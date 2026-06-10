import type { SolicitudTutorResponse } from './types'

const storageKey = (usuarioId: number) => `tutorspace-solicitud-tutor-${usuarioId}`
export const SOLICITUD_TUTOR_STORAGE_EVENT = 'tutorspace:solicitud-tutor-actualizada'

export const guardarSolicitudTutorLocal = (
    usuarioId: number,
    solicitud: SolicitudTutorResponse
): void => {
    localStorage.setItem(storageKey(usuarioId), JSON.stringify(solicitud))
    window.dispatchEvent(new CustomEvent(SOLICITUD_TUTOR_STORAGE_EVENT, {
        detail: { usuarioId, solicitud },
    }))
}

export const habilitarNuevaSolicitudTutorLocal = (usuarioId: number): void => {
    localStorage.removeItem(storageKey(usuarioId))
    window.dispatchEvent(new CustomEvent(SOLICITUD_TUTOR_STORAGE_EVENT, {
        detail: { usuarioId },
    }))
}

export const obtenerSolicitudTutorLocal = (
    usuarioId: number
): SolicitudTutorResponse | null => {
    const value = localStorage.getItem(storageKey(usuarioId))
    if (!value) return null

    try {
        const solicitud = JSON.parse(value) as SolicitudTutorResponse
        return {
            ...solicitud,
            estado: String(solicitud.estado).trim().toUpperCase() as SolicitudTutorResponse['estado'],
            observaciones: solicitud.observaciones || null,
        }
    } catch {
        localStorage.removeItem(storageKey(usuarioId))
        return null
    }
}
