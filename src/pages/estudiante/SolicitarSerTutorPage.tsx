import { useCallback, useEffect, useState } from 'react'
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    Clock3,
    GraduationCap,
    Loader2,
    LogOut,
    Send,
    XCircle,
} from 'lucide-react'
import { estudianteApi } from '../../api/estudianteApi'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
    guardarSolicitudTutorLocal,
    habilitarNuevaSolicitudTutorLocal,
    obtenerSolicitudTutorLocal,
    SOLICITUD_TUTOR_STORAGE_EVENT,
} from '../../features/solicitudesTutor/solicitudTutorStorage'
import {
    obtenerMensajeSolicitudTutor,
} from '../../features/solicitudesTutor/solicitudTutorErrors'
import { solicitudesTutorApi } from '../../features/solicitudesTutor/solicitudesTutorApi'
import type { SolicitudTutorResponse } from '../../features/solicitudesTutor/types'
import { useAuthStore } from '../../store/authStore'
import type { MateriaResponse } from '../../types'

export default function SolicitarSerTutorPage() {
    const usuario = useAuthStore((state) => state.usuario)
    const logout = useAuthStore((state) => state.logout)
    const [materias, setMaterias] = useState<MateriaResponse[]>([])
    const [materiaIds, setMateriaIds] = useState<number[]>([])
    const [justificacion, setJustificacion] = useState('')
    const [solicitud, setSolicitud] = useState<SolicitudTutorResponse | null>(null)
    const [modoNuevaSolicitud, setModoNuevaSolicitud] = useState(false)
    const [cargandoSolicitud, setCargandoSolicitud] = useState(true)
    const [consultaSolicitudFallida, setConsultaSolicitudFallida] = useState(false)
    const [cargandoMaterias, setCargandoMaterias] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState('')

    const cargarMiSolicitud = useCallback(async (mostrarCarga = true) => {
        if (!usuario) return

        try {
            if (mostrarCarga) setCargandoSolicitud(true)
            setConsultaSolicitudFallida(false)
            const solicitudActual = await solicitudesTutorApi.obtenerMia()
            setSolicitud(solicitudActual)

            if (solicitudActual) {
                guardarSolicitudTutorLocal(usuario.id, solicitudActual)
            } else {
                habilitarNuevaSolicitudTutorLocal(usuario.id)
                setModoNuevaSolicitud(false)
            }
        } catch (loadError) {
            setConsultaSolicitudFallida(true)
            setError(obtenerMensajeSolicitudTutor(
                loadError,
                'No fue posible consultar el estado actual de tu solicitud.'
            ))
        } finally {
            if (mostrarCarga) setCargandoSolicitud(false)
        }
    }, [usuario])

    useEffect(() => {
        if (!usuario) return

        setSolicitud(obtenerSolicitudTutorLocal(usuario.id))

        const cargarMaterias = async () => {
            try {
                setCargandoMaterias(true)
                setMaterias(await estudianteApi.getMaterias())
            } catch (loadError) {
                setError(obtenerMensajeSolicitudTutor(
                    loadError,
                    'No fue posible cargar las materias disponibles.'
                ))
            } finally {
                setCargandoMaterias(false)
            }
        }

        cargarMaterias()
        cargarMiSolicitud()
    }, [usuario, cargarMiSolicitud])

    useEffect(() => {
        if (!usuario) return

        const sincronizarSolicitud = () => {
            setSolicitud(obtenerSolicitudTutorLocal(usuario.id))
        }

        const handleStorage = (event: StorageEvent) => {
            if (event.key === `tutorspace-solicitud-tutor-${usuario.id}`) {
                sincronizarSolicitud()
            }
        }

        const handleSolicitudActualizada = () => sincronizarSolicitud()

        window.addEventListener('storage', handleStorage)
        window.addEventListener(SOLICITUD_TUTOR_STORAGE_EVENT, handleSolicitudActualizada)

        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener(SOLICITUD_TUTOR_STORAGE_EVENT, handleSolicitudActualizada)
        }
    }, [usuario])

    const estadoSolicitud = solicitud
        ? String(solicitud.estado).trim().toUpperCase()
        : null

    useEffect(() => {
        if (estadoSolicitud !== 'PENDIENTE') return

        const intervalId = window.setInterval(() => {
            cargarMiSolicitud(false)
        }, 10000)

        return () => window.clearInterval(intervalId)
    }, [estadoSolicitud, cargarMiSolicitud])

    const alternarMateria = (materiaId: number) => {
        setMateriaIds((actuales) => (
            actuales.includes(materiaId)
                ? actuales.filter((id) => id !== materiaId)
                : [...actuales, materiaId]
        ))
    }

    const enviarSolicitud = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (solicitud && !modoNuevaSolicitud) {
            setError('Ya registraste una solicitud y no puedes enviar otra.')
            return
        }

        if (modoNuevaSolicitud && estadoSolicitud !== 'RECHAZADA') {
            setError('Solo puedes crear una nueva solicitud después de un rechazo.')
            return
        }

        if (materiaIds.length === 0) {
            setError('Debes seleccionar al menos una materia.')
            return
        }

        const justificacionLimpia = justificacion.trim()
        if (!justificacionLimpia) {
            setError('La justificación es requerida.')
            return
        }

        try {
            setEnviando(true)
            const creada = await solicitudesTutorApi.crear({
                materiaIds,
                justificacion: justificacionLimpia,
            })

            setSolicitud(creada)
            setModoNuevaSolicitud(false)
            if (usuario) guardarSolicitudTutorLocal(usuario.id, creada)
        } catch (submitError) {
            if (usuario) {
                try {
                    const solicitudActual = await solicitudesTutorApi.obtenerMia()
                    if (solicitudActual) {
                        setSolicitud(solicitudActual)
                        guardarSolicitudTutorLocal(usuario.id, solicitudActual)
                    }
                } catch {
                    // Se conserva el mensaje original del intento de creación.
                }
            }
            setError(obtenerMensajeSolicitudTutor(
                submitError,
                'No se pudo enviar la solicitud. Intenta nuevamente.'
            ))
        } finally {
            setEnviando(false)
        }
    }

    const cerrarSesionParaActualizarRol = () => {
        logout()
        window.location.href = '/login'
    }

    const prepararNuevaSolicitudTrasRechazo = () => {
        if (!usuario || estadoSolicitud !== 'RECHAZADA') return

        setModoNuevaSolicitud(true)
        setMateriaIds([])
        setJustificacion('')
        setError('')
    }

    const estadoVisual = estadoSolicitud === 'APROBADA'
        ? {
            card: 'border-emerald-200 dark:border-emerald-900/50',
            header: 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50',
            title: 'text-emerald-900 dark:text-emerald-100',
            notice: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-100',
            icon: <CheckCircle2 className="w-5 h-5" />,
            message: 'Tu solicitud fue aprobada. Cierra sesión e inicia nuevamente para activar tu perfil de tutor.',
        }
        : estadoSolicitud === 'RECHAZADA'
            ? {
                card: 'border-red-200 dark:border-red-900/50',
                header: 'bg-red-50/70 dark:bg-red-500/10 border-red-200 dark:border-red-900/50',
                title: 'text-red-900 dark:text-red-100',
                notice: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-100',
                icon: <XCircle className="w-5 h-5" />,
                message: 'Tu solicitud fue rechazada. Puedes corregir la información y enviar una nueva solicitud.',
            }
            : {
                card: 'border-amber-200 dark:border-amber-900/50',
                header: 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/50',
                title: 'text-amber-900 dark:text-amber-100',
                notice: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-100',
                icon: <Clock3 className="w-5 h-5" />,
                message: 'Tu solicitud fue enviada y está pendiente de revisión.',
            }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Solicitar ser Tutor
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base">
                        Selecciona las materias que puedes impartir y explica por qué deseas apoyar a otros estudiantes.
                    </p>
                </div>

                {cargandoSolicitud && !solicitud ? (
                    <Card className="shadow-sm">
                        <CardContent className="flex items-center justify-center gap-2 py-12 text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Consultando tu solicitud...
                        </CardContent>
                    </Card>
                ) : consultaSolicitudFallida && !solicitud ? (
                    <Card className="border-red-200 dark:border-red-900/50 shadow-sm">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>No se pudo comprobar si ya tienes una solicitud. El formulario permanecerá bloqueado.</p>
                            </div>
                            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                                Reintentar
                            </Button>
                        </CardContent>
                    </Card>
                ) : solicitud && !modoNuevaSolicitud ? (
                    <Card className={`${estadoVisual.card} shadow-sm`}>
                        <CardHeader className={`${estadoVisual.header} border-b`}>
                            <CardTitle className={`flex items-center gap-2 ${estadoVisual.title}`}>
                                {estadoVisual.icon}
                                Solicitud {solicitud.estado.toLowerCase()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className={`flex gap-3 rounded-xl border p-4 text-sm ${estadoVisual.notice}`}>
                                <span className="shrink-0 mt-0.5">{estadoVisual.icon}</span>
                                <p>{estadoVisual.message}</p>
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Materias solicitadas</p>
                                <div className="flex flex-wrap gap-2">
                                    {solicitud.materias.map((materia) => (
                                        <span
                                            key={materia.id}
                                            className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                        >
                                            {materia.nombre} ({materia.codigo})
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Justificación</p>
                                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    {solicitud.justificacion}
                                </p>
                            </div>

                            {solicitud.observaciones && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                        Observaciones de la revisión
                                    </p>
                                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                        {solicitud.observaciones}
                                    </p>
                                </div>
                            )}

                            <p className="text-xs text-slate-500">
                                {estadoSolicitud === 'RECHAZADA'
                                    ? 'Puedes enviar una nueva solicitud cuando estés listo.'
                                    : 'Ya existe una solicitud registrada para tu usuario, por lo que el formulario permanecerá bloqueado.'}
                            </p>

                            {estadoSolicitud === 'APROBADA' && (
                                <Button type="button" onClick={cerrarSesionParaActualizarRol}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Cerrar sesión y volver a ingresar
                                </Button>
                            )}

                            {estadoSolicitud === 'RECHAZADA' && (
                                <Button type="button" onClick={prepararNuevaSolicitudTrasRechazo}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Crear nueva solicitud
                                </Button>
                            )}

                            {estadoSolicitud === 'PENDIENTE' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => cargarMiSolicitud()}
                                    disabled={cargandoSolicitud}
                                >
                                    {cargandoSolicitud && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Actualizar estado
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-primary" />
                                    Datos de la solicitud
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {modoNuevaSolicitud && (
                                    <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                                        <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        La solicitud anterior fue rechazada. Puedes enviar una nueva con información actualizada.
                                    </div>
                                )}
                                <form onSubmit={enviarSolicitud} className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Materias que deseas impartir
                                            </label>
                                            <span className="text-xs text-slate-500">
                                                {materiaIds.length} seleccionada{materiaIds.length === 1 ? '' : 's'}
                                            </span>
                                        </div>

                                        {cargandoMaterias ? (
                                            <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-slate-500">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Cargando materias...
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {materias.map((materia) => {
                                                    const seleccionada = materiaIds.includes(materia.id)
                                                    return (
                                                        <button
                                                            key={materia.id}
                                                            type="button"
                                                            onClick={() => alternarMateria(materia.id)}
                                                            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                                                                seleccionada
                                                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                                    : 'border-slate-200 hover:border-primary/40 dark:border-slate-800'
                                                            }`}
                                                        >
                                                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                                                seleccionada
                                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                                    : 'border-slate-300 dark:border-slate-700'
                                                            }`}>
                                                                {seleccionada && <CheckCircle2 className="w-4 h-4" />}
                                                            </span>
                                                            <span>
                                                                <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                                    {materia.nombre}
                                                                </span>
                                                                <span className="text-xs text-slate-500">{materia.codigo}</span>
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="justificacion-solicitud-tutor"
                                            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                                        >
                                            Justificación
                                        </label>
                                        <textarea
                                            id="justificacion-solicitud-tutor"
                                            rows={6}
                                            value={justificacion}
                                            onChange={(event) => setJustificacion(event.target.value)}
                                            placeholder="Describe tus conocimientos, experiencia y motivación para ser tutor."
                                            className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:text-slate-100"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
                                        <Button
                                            type="submit"
                                            disabled={enviando || cargandoMaterias}
                                            className="w-full sm:w-auto"
                                        >
                                            {enviando ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                                            ) : (
                                                <><Send className="w-4 h-4 mr-2" /> Enviar solicitud</>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="h-fit shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    Proceso de revisión
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                                <p>El administrador revisará las materias y la justificación enviada.</p>
                                <p>Mientras se realiza la revisión, la solicitud permanecerá en estado pendiente.</p>
                                <p>Si es aprobada, deberás cerrar sesión e iniciar nuevamente para activar el perfil de tutor.</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
