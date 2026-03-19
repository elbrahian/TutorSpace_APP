import { useCallback } from 'react'
import { sesionApi } from '../api/sesionApi'
import { useSesionStore } from '../store/sesionStore'
import { useAuthStore } from '../store/authStore'
import type { EstadoSesion } from '../types'

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

    const cargarSesiones = useCallback(async () => {
        if (!usuario) return
        try {
            setCargando(true)
            const data = usuario.rol === 'TUTOR' 
                ? await sesionApi.getSesionesTutor()
                : await sesionApi.getSesionesEstudiante()
            setSesiones(data)
        } catch (error) {
            console.error("Error al cargar sesiones", error)
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
            const actualizada = await sesionApi.cambiarEstado(id, nuevoEstado)
            actualizarSesion(actualizada)
            return actualizada
        } catch (error) {
            console.error("Error al cambiar estado de sesión", error)
            throw error
        }
    }

    return {
        sesiones,
        cargando,
        cargarSesiones,
        crearSesion,
        cambiarEstado
    }
}
