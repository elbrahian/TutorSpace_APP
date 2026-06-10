import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { AlertCircle, Download, Loader2, MessageSquare, RefreshCw, Search, Star } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog'
import { reportesApi } from '../../api/reportesApi'
import { exportarReportePdf } from '../../utils/exportarReportePdf'
import type { ReporteCalificacionTutorResponse } from '../../types'

const columnas = [
    { label: '#', align: 'text-center' as const },
    { label: 'Tutor', align: 'text-left' as const },
    { label: 'Promedio', align: 'text-left' as const },
    { label: 'Distribución', align: 'text-left' as const },
    { label: 'Total evaluaciones', align: 'text-right' as const },
    { label: 'Comentarios', align: 'text-center' as const },
]

const formatoNumero = (valor: number) =>
    new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(valor)

const formatoFecha = (valor: string) => {
    if (!valor) return ''
    const [anio, mes, dia] = valor.split('-')
    return `${dia}/${mes}/${anio}`
}

const Estrellas = ({ valor }: { valor: number }) => {
    const redondeado = Math.round(valor)
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${formatoNumero(valor)} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((indice) => (
                <Star
                    key={indice}
                    className={`w-4 h-4 ${indice <= redondeado ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                />
            ))}
        </span>
    )
}

export default function ReporteCalificacionTutores() {
    const [reportes, setReportes] = useState<ReporteCalificacionTutorResponse[]>([])
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [filtrosAplicados, setFiltrosAplicados] = useState({ fechaInicio: '', fechaFin: '' })
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')
    const [tutorSeleccionado, setTutorSeleccionado] = useState<ReporteCalificacionTutorResponse | null>(null)

    const cargarReporte = useCallback(async (inicio: string, fin: string) => {
        try {
            setCargando(true)
            setError('')
            const params = {
                ...(inicio ? { fechaInicio: inicio } : {}),
                ...(fin ? { fechaFin: fin } : {}),
            }
            const data = await reportesApi.getCalificacionesTutores(params)
            setReportes(data)
            setFiltrosAplicados({ fechaInicio: inicio, fechaFin: fin })
        } catch (e: unknown) {
            const mensaje = isAxiosError<{ message?: string }>(e)
                ? e.response?.data?.message
                : undefined
            setError(mensaje || 'No se pudo cargar el reporte de calificaciones.')
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargarReporte('', '')
    }, [cargarReporte])

    const fechaNombreArchivo = () => new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Bogota',
    }).format(new Date())

    const textoPeriodo = () =>
        filtrosAplicados.fechaInicio || filtrosAplicados.fechaFin
            ? `Periodo: ${formatoFecha(filtrosAplicados.fechaInicio) || 'Sin fecha inicio'} - ${formatoFecha(filtrosAplicados.fechaFin) || 'Sin fecha fin'}`
            : 'Periodo: Todos los periodos'

    const exportarPdf = async () => {
        try {
            setError('')
            await exportarReportePdf({
                title: 'Reporte de Calificacion de Tutores',
                subtitle: 'Ranking por promedio de evaluaciones de estudiantes',
                fileName: `Reporte de Calificacion de Tutores - ${fechaNombreArchivo()}.pdf`,
                metadata: [textoPeriodo()],
                columns: [
                    { header: 'Posición', align: 'center' },
                    { header: 'Tutor', align: 'left' },
                    { header: 'Promedio', align: 'right' },
                    { header: 'Total', align: 'right' },
                    { header: '5 estrellas', align: 'right' },
                    { header: '4 estrellas', align: 'right' },
                    { header: '3 estrellas', align: 'right' },
                    { header: '2 estrellas', align: 'right' },
                    { header: '1 estrella', align: 'right' },
                ],
                rows: reportes.map((reporte, indice) => [
                    indice + 1,
                    reporte.nombreTutor,
                    formatoNumero(reporte.promedioCalificacion),
                    reporte.totalEvaluaciones,
                    reporte.estrellas5,
                    reporte.estrellas4,
                    reporte.estrellas3,
                    reporte.estrellas2,
                    reporte.estrellas1,
                ]),
            })
        } catch {
            setError('No se pudo exportar el PDF.')
        }
    }

    const distribucion = (reporte: ReporteCalificacionTutorResponse) => [
        { estrellas: 5, total: reporte.estrellas5 },
        { estrellas: 4, total: reporte.estrellas4 },
        { estrellas: 3, total: reporte.estrellas3 },
        { estrellas: 2, total: reporte.estrellas2 },
        { estrellas: 1, total: reporte.estrellas1 },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Calificación de Tutores</h1>
                        <p className="text-slate-500 mt-2">Ranking por promedio de evaluaciones, distribución de estrellas y comentarios de estudiantes.</p>
                    </div>
                </div>

                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
                            <div>
                                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">Fecha inicio</label>
                                <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">Fecha fin</label>
                                <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                            </div>
                            <Button onClick={() => cargarReporte(fechaInicio, fechaFin)} disabled={cargando} className="flex items-center gap-2">
                                {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Aplicar filtros
                            </Button>
                            <Button onClick={exportarPdf} disabled={cargando || reportes.length === 0} className="flex items-center gap-2">
                                <Download className="w-4 h-4" /> Exportar PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => cargarReporte(fechaInicio, fechaFin)} className="flex items-center gap-2 self-start sm:self-auto">
                            <RefreshCw className="w-4 h-4" /> Reintentar
                        </Button>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b">
                                <tr>
                                    {columnas.map((columna) => (
                                        <th key={columna.label} className={`px-6 py-4 font-semibold ${columna.align}`}>
                                            {columna.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cargando && (
                                    <tr>
                                        <td colSpan={columnas.length} className="px-6 py-10 text-center text-slate-500">
                                            <div className="inline-flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                Cargando reporte...
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!cargando && reportes.map((reporte, indice) => (
                                    <tr key={reporte.tutorId} className="border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500">{indice + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{reporte.nombreTutor}</div>
                                            <div className="text-xs text-slate-500">ID {reporte.tutorId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Estrellas valor={reporte.promedioCalificacion} />
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatoNumero(reporte.promedioCalificacion)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {distribucion(reporte).map(({ estrellas, total }) => (
                                                    <span
                                                        key={estrellas}
                                                        title={`${total} evaluación(es) de ${estrellas} estrella(s)`}
                                                        className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-slate-600 dark:text-slate-300"
                                                    >
                                                        {estrellas}<Star className="w-3 h-3 text-amber-400 fill-amber-400" />{total}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{reporte.totalEvaluaciones}</td>
                                        <td className="px-6 py-4 text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setTutorSeleccionado(reporte)}
                                                className="inline-flex items-center gap-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                {reporte.comentarios.length}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}

                                {!cargando && reportes.length === 0 && (
                                    <tr>
                                        <td colSpan={columnas.length} className="px-6 py-10 text-center text-slate-500">
                                            No hay evaluaciones registradas para el periodo seleccionado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={tutorSeleccionado !== null} onOpenChange={(abierto) => !abierto && setTutorSeleccionado(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Comentarios de {tutorSeleccionado?.nombreTutor}</DialogTitle>
                        <DialogDescription>
                            Evaluaciones escritas por estudiantes. Son de solo lectura.
                        </DialogDescription>
                    </DialogHeader>

                    {tutorSeleccionado && tutorSeleccionado.comentarios.length === 0 && (
                        <p className="text-sm text-slate-500 py-6 text-center">
                            Este tutor no tiene comentarios en el periodo seleccionado.
                        </p>
                    )}

                    <div className="space-y-3">
                        {tutorSeleccionado?.comentarios.map((comentario) => (
                            <div
                                key={comentario.calificacionId}
                                className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50"
                            >
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <span className="font-medium text-slate-900 dark:text-slate-100">{comentario.nombreEstudiante}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Estrellas valor={comentario.calificacion} />
                                        <span className="text-xs text-slate-500">{formatoFecha(comentario.fechaSesion)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comentario.comentario}</p>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
