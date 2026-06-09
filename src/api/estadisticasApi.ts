import axiosInstance from './axiosInstance'

export interface ActividadMensual {
    mes: number
    nombreMes: string
    sesiones: number
}

export interface EstudianteDashboardStats {
    totalSesionesCompletadas: number
    totalHorasTutoria: number
    materiaMasConsultada: string
    tutorFrecuente: string
    actividadMensual: ActividadMensual[]
}

function normalizarActividadMensual(raw: unknown): ActividadMensual[] {
    if (!Array.isArray(raw)) return []

    return raw
        .map((item) => {
            if (!item || typeof item !== 'object') return null

            const fila = item as Record<string, unknown>
            const mes = Number(fila.mes)
            const sesiones = Number(fila.sesiones ?? 0)
            const nombreMes = String(fila.nombreMes ?? '')

            if (!Number.isFinite(mes)) return null

            return {
                mes,
                nombreMes,
                sesiones: Number.isFinite(sesiones) ? sesiones : 0,
            }
        })
        .filter((item): item is ActividadMensual => item !== null)
}

function normalizarEstadisticas(raw: unknown): EstudianteDashboardStats {
    const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

    return {
        totalSesionesCompletadas: Number(data.totalSesionesCompletadas ?? 0),
        totalHorasTutoria: Number(data.totalHorasTutoria ?? 0),
        materiaMasConsultada: String(data.materiaMasConsultada ?? 'N/A'),
        tutorFrecuente: String(data.tutorFrecuente ?? 'N/A'),
        actividadMensual: normalizarActividadMensual(data.actividadMensual),
    }
}

export const estadisticasApi = {
    getEstadisticas: async (): Promise<EstudianteDashboardStats> => {
        const response = await axiosInstance.get('/estudiante/estadisticas')
        return normalizarEstadisticas(response.data)
    },
}
