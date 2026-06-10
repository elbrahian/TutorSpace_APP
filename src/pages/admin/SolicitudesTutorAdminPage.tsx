import { useEffect, useState } from 'react'
import {
    AlertCircle,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Loader2,
    Mail,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { obtenerMensajeSolicitudTutor } from '../../features/solicitudesTutor/solicitudTutorErrors'
import { guardarSolicitudTutorLocal } from '../../features/solicitudesTutor/solicitudTutorStorage'
import { solicitudesTutorApi } from '../../features/solicitudesTutor/solicitudesTutorApi'
import type {
    EstadoRevisionSolicitudTutor,
    EstadoSolicitudTutor,
    SolicitudTutorResponse,
} from '../../features/solicitudesTutor/types'

const estadoStyles: Record<EstadoSolicitudTutor, string> = {
    PENDIENTE: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    APROBADA: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    RECHAZADA: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
}

const EstadoBadge = ({ estado }: { estado: EstadoSolicitudTutor }) => (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${estadoStyles[estado]}`}>
        {estado}
    </span>
)

const formatearFecha = (fecha: string) => new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
}).format(new Date(fecha))

export default function SolicitudesTutorAdminPage() {
    const [solicitudes, setSolicitudes] = useState<SolicitudTutorResponse[]>([])
    const [estado, setEstado] = useState<EstadoSolicitudTutor | ''>('')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [seleccionada, setSeleccionada] = useState<SolicitudTutorResponse | null>(null)
    const [nuevoEstado, setNuevoEstado] = useState<EstadoRevisionSolicitudTutor>('APROBADA')
    const [observaciones, setObservaciones] = useState('')
    const [revisando, setRevisando] = useState(false)
    const [errorRevision, setErrorRevision] = useState('')

    const cargarSolicitudes = async (
        filtros: { estado?: EstadoSolicitudTutor; inicio?: string; fin?: string } = {}
    ) => {
        try {
            setCargando(true)
            setError('')
            setSolicitudes(await solicitudesTutorApi.listar(filtros))
        } catch (loadError) {
            setError(obtenerMensajeSolicitudTutor(
                loadError,
                'No fue posible cargar las solicitudes.'
            ))
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarSolicitudes()
    }, [])

    const aplicarFiltros = () => {
        setMensaje('')

        if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
            setError('La fecha de inicio no puede ser posterior a la fecha fin.')
            return
        }

        cargarSolicitudes({
            estado: estado || undefined,
            inicio: fechaInicio || undefined,
            fin: fechaFin || undefined,
        })
    }

    const limpiarFiltros = () => {
        setEstado('')
        setFechaInicio('')
        setFechaFin('')
        setMensaje('')
        cargarSolicitudes()
    }

    const abrirRevision = (
        solicitud: SolicitudTutorResponse,
        revision: EstadoRevisionSolicitudTutor
    ) => {
        setSeleccionada(solicitud)
        setNuevoEstado(revision)
        setObservaciones('')
        setErrorRevision('')
    }

    const revisarSolicitud = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!seleccionada) return

        try {
            setRevisando(true)
            setErrorRevision('')

            const respuesta = await solicitudesTutorApi.revisar(seleccionada.id, {
                nuevoEstado,
                observaciones: observaciones.trim() || null,
            })
            const actualizada: SolicitudTutorResponse = {
                ...seleccionada,
                ...respuesta,
                estado: nuevoEstado,
                observaciones: respuesta.observaciones ?? (observaciones.trim() || null),
            }

            setSolicitudes((actuales) => actuales.map((solicitud) => (
                solicitud.id === actualizada.id ? actualizada : solicitud
            )))
            guardarSolicitudTutorLocal(actualizada.solicitanteId, actualizada)
            setSeleccionada(null)
            setMensaje(
                nuevoEstado === 'APROBADA'
                    ? 'Solicitud aprobada. El usuario deberá iniciar sesión nuevamente para activar su perfil de tutor.'
                    : 'Solicitud rechazada correctamente.'
            )
        } catch (reviewError) {
            setErrorRevision(obtenerMensajeSolicitudTutor(
                reviewError,
                'No fue posible revisar la solicitud.'
            ))
        } finally {
            setRevisando(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Solicitudes para ser Tutor
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base">
                        Consulta las postulaciones de estudiantes y aprueba o rechaza las solicitudes pendientes.
                    </p>
                </div>

                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 items-end">
                            <div>
                                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">Estado</label>
                                <select
                                    value={estado}
                                    onChange={(event) => setEstado(event.target.value as EstadoSolicitudTutor | '')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="APROBADA">Aprobada</option>
                                    <option value="RECHAZADA">Rechazada</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">Fecha inicio</label>
                                <Input type="date" value={fechaInicio} onChange={(event) => setFechaInicio(event.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">Fecha fin</label>
                                <Input type="date" value={fechaFin} onChange={(event) => setFechaFin(event.target.value)} />
                            </div>
                            <Button onClick={aplicarFiltros} disabled={cargando}>
                                <Search className="w-4 h-4 mr-2" /> Buscar
                            </Button>
                            <Button variant="outline" onClick={limpiarFiltros} disabled={cargando}>
                                <RotateCcw className="w-4 h-4 mr-2" /> Limpiar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        {mensaje}
                    </div>
                )}

                <div className="md:hidden space-y-4">
                    {cargando ? (
                        <div className="flex justify-center gap-2 rounded-xl border p-10 text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin" /> Cargando solicitudes...
                        </div>
                    ) : solicitudes.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-10 text-center text-slate-500">
                            No hay solicitudes para los filtros seleccionados.
                        </div>
                    ) : solicitudes.map((solicitud) => (
                        <Card key={solicitud.id} className="shadow-sm">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-bold text-slate-900 dark:text-slate-100">
                                            {solicitud.nombreSolicitante}
                                        </h2>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Mail className="w-3.5 h-3.5" /> {solicitud.emailSolicitante}
                                        </p>
                                    </div>
                                    <EstadoBadge estado={solicitud.estado} />
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {solicitud.materias.map((materia) => (
                                        <span key={materia.id} className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                            {materia.codigo}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-300">{solicitud.justificacion}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <CalendarDays className="w-3.5 h-3.5" /> {formatearFecha(solicitud.fechaEnvio)}
                                </p>

                                {solicitud.estado === 'PENDIENTE' && (
                                    <div className="grid grid-cols-2 gap-2 border-t pt-4 dark:border-slate-800">
                                        <Button variant="outline" onClick={() => abrirRevision(solicitud, 'RECHAZADA')}>
                                            <XCircle className="w-4 h-4 mr-2 text-red-500" /> Rechazar
                                        </Button>
                                        <Button onClick={() => abrirRevision(solicitud, 'APROBADA')}>
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Aprobar
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="border-b bg-slate-50/50 text-xs uppercase text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">Solicitante</th>
                                    <th className="px-6 py-4">Materias</th>
                                    <th className="px-6 py-4">Justificación</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" /> Cargando solicitudes...
                                            </span>
                                        </td>
                                    </tr>
                                )}

                                {!cargando && solicitudes.map((solicitud) => (
                                    <tr key={solicitud.id} className="border-b align-top hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/50">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                {solicitud.nombreSolicitante}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">{solicitud.emailSolicitante}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex max-w-52 flex-wrap gap-1.5">
                                                {solicitud.materias.map((materia) => (
                                                    <span key={materia.id} className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                                        {materia.codigo}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="max-w-sm text-slate-600 dark:text-slate-300">
                                                {solicitud.justificacion}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {formatearFecha(solicitud.fechaEnvio)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <EstadoBadge estado={solicitud.estado} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {solicitud.estado === 'PENDIENTE' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => abrirRevision(solicitud, 'RECHAZADA')}>
                                                        Rechazar
                                                    </Button>
                                                    <Button size="sm" onClick={() => abrirRevision(solicitud, 'APROBADA')}>
                                                        Aprobar
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {!cargando && solicitudes.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                            No hay solicitudes para los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {seleccionada && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                            <div className="mb-5">
                                <div className="flex items-center gap-2 text-primary">
                                    {nuevoEstado === 'APROBADA'
                                        ? <ClipboardCheck className="w-5 h-5" />
                                        : <XCircle className="w-5 h-5" />}
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        Revisión de solicitud
                                    </span>
                                </div>
                                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                                    {nuevoEstado === 'APROBADA' ? 'Aprobar' : 'Rechazar'} solicitud de {seleccionada.nombreSolicitante}
                                </h2>
                            </div>

                            <form onSubmit={revisarSolicitud} className="space-y-5">
                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <BookOpen className="w-4 h-4" /> Materias
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {seleccionada.materias.map((materia) => (
                                            <span key={materia.id} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                                {materia.nombre}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="observaciones-revision" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Observaciones (opcional)
                                    </label>
                                    <textarea
                                        id="observaciones-revision"
                                        rows={4}
                                        value={observaciones}
                                        onChange={(event) => setObservaciones(event.target.value)}
                                        placeholder={nuevoEstado === 'APROBADA'
                                            ? 'Ejemplo: Cumple con los criterios.'
                                            : 'Ejemplo: Debe fortalecer su experiencia.'}
                                        className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {errorRevision && (
                                    <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        {errorRevision}
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
                                    <Button type="button" variant="outline" onClick={() => setSeleccionada(null)} disabled={revisando}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant={nuevoEstado === 'RECHAZADA' ? 'destructive' : 'default'}
                                        disabled={revisando}
                                    >
                                        {revisando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Confirmar {nuevoEstado === 'APROBADA' ? 'aprobación' : 'rechazo'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
