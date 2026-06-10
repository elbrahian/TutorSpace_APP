import { useCallback, useState } from 'react'
import { sesionApi, getMisSesionesConFiltros, completarSesion } from '../api/sesionApi'
import type { SesionFiltros } from '../api/sesionApi'
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

    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

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

    const cargarConFiltros = useCallback(async (filtros: SesionFiltros) => {
        if (!usuario) return
        try {
            setCargando(true)
            setError(null)
            const response = await getMisSesionesConFiltros(filtros)
            setSesiones(response.content)
            setTotalPages(response.totalPages)
            setTotalElements(response.totalElements)
        } catch (err: any) {
            console.error("Error al cargar sesiones con filtros", err)
            const errorMsg = err.response?.data?.message || err.response?.data || 'No se pudieron cargar las tutorías. Revisa los filtros.'
            setError(typeof errorMsg === 'string' ? errorMsg : 'Error del servidor')
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

    const ejecutarAccion = async (tipo: 'confirmar' | 'rechazar' | 'cancelar' | 'completar', sesionId: number) => {
        try {
            setActionLoading(sesionId)
            let actualizada;
            if (tipo === 'confirmar') {
                actualizada = await sesionApi.cambiarEstado(sesionId, 'APROBADA')
            } else if (tipo === 'rechazar' || tipo === 'cancelar') {
                actualizada = await sesionApi.cambiarEstado(sesionId, 'CANCELADA')
            } else if (tipo === 'completar') {
                actualizada = await completarSesion(sesionId)
            }
            if (actualizada) {
                actualizarSesion(actualizada)
            }
        } catch (err) {
            console.error(`Error al ejecutar acción ${tipo} en sesión ${sesionId}`, err)
            throw err
        } finally {
            setActionLoading(null)
        }
    }

    return {
        sesiones,
        cargando,
        totalPages,
        totalElements,
        error,
        actionLoading,
        cargarSesiones,
        cargarConFiltros,
        crearSesion,
        cambiarEstado,
        ejecutarAccion
    }
}
