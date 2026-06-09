import { useCallback, useState } from 'react'
import { sesionApi } from '../api/sesionApi'
import { useSesionStore } from '../store/sesionStore'
import { useAuthStore } from '../store/authStore'
import type { EstadoSesion } from '../types'

const parsearError = (error: any, accion: string): string => {
    const serverMsg = error?.response?.data?.message
    if (serverMsg) return serverMsg
    const status = error?.response?.status
    if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    if (status === 403) return `No tienes permiso para ${accion}.`
    if (status === 404) return 'La sesión o disponibilidad no existe.'
    if (status === 409) return 'Esta franja horaria ya fue reservada. Selecciona otra.'
    if (status >= 500) return 'Error en el servidor. Intenta de nuevo en unos momentos.'
    if (!navigator.onLine) return 'Sin conexión a internet. Verifica tu red.'
    return `No se pudo ${accion}. Intenta de nuevo.`
}

export const useSesiones = () => {
    const { usuario } = useAuthStore()
    const {
        sesiones,
        cargando,
        setSesiones,
        agregarSesion,
        actualizarSesion,
        setCargando
    } = useSesionStore()

    const [error, setError] = useState<string | null>(null)

    const cargarSesiones = useCallback(async () => {
        if (!usuario) return
        try {
            setError(null)
            setCargando(true)
            const data = usuario.rol === 'TUTOR'
                ? await sesionApi.getSesionesTutor()
                : await sesionApi.getSesionesEstudiante()
            setSesiones(data)
        } catch (err) {
            console.error("Error al cargar sesiones", err)
            setError(parsearError(err, 'cargar tus sesiones'))
        } finally {
            setCargando(false)
        }
    }, [usuario, setSesiones, setCargando])

    const crearSesion = async (data: {
        estudianteId: number
        disponibilidadId: number
        fecha: string
        horaInicio: string
        horaFin: string
    }) => {
        const sesion = await sesionApi.crearSesion(data)
        agregarSesion(sesion)
        return sesion
    }

    const cambiarEstado = async (id: number, nuevoEstado: EstadoSesion) => {
        try {
            setError(null)
            const actualizada = await sesionApi.cambiarEstado(id, nuevoEstado)
            actualizarSesion(actualizada)
            return actualizada
        } catch (err) {
            console.error("Error al cambiar estado de sesión", err)
            const msg = parsearError(err, 'cambiar el estado de la sesión')
            setError(msg)
            throw new Error(msg)
        }
    }

    return {
        sesiones,
        cargando,
        error,
        clearError: () => setError(null),
        cargarSesiones,
        crearSesion,
        cambiarEstado
    }
}
