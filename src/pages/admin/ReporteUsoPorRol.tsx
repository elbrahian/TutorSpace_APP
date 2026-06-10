import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { AlertCircle, Calendar, Download, GraduationCap, Loader2, MessageSquare, RefreshCw, Search, UserCog, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { GraficoActividadSemanal } from '../../components/reportes/GraficoActividadSemanal'
import { reportesApi } from '../../api/reportesApi'
import { exportarReportePdf } from '../../utils/exportarReportePdf'
import type { ReporteUsoResponse, Rol } from '../../types'

const etiquetaRol: Record<Rol, string> = {
    ESTUDIANTE: 'Estudiantes',
    TUTOR: 'Tutores',
    ADMIN: 'Administradores',
}

const reporteVacio: ReporteUsoResponse = {
    estudiantesActivos: 0,
    tutoresActivos: 0,
    adminsActivos: 0,
    totalSesionesCreadas: 0,
    totalMensajesEnviados: 0,
    metricasPorRol: [],
    actividadSemanal: [],
}

const columnas = [
    { header: 'Rol' },
    { header: 'Usuarios activos', align: 'right' as const },
    { header: 'Sesiones', align: 'right' as const },
    { header: 'Mensajes enviados', align: 'right' as const },
]

export default function ReporteUsoPorRol() {
    const fechaInicioRef = useRef<HTMLInputElement>(null)
    const fechaFinRef = useRef<HTMLInputElement>(null)
    const [reporte, setReporte] = useState<ReporteUsoResponse>(reporteVacio)
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [filtrosAplicados, setFiltrosAplicados] = useState({ fechaInicio: '', fechaFin: '' })
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')

    const cargarReporte = useCallback(async (inicio: string, fin: string) => {
        try {
            setCargando(true)
            setError('')
            const params = {
                ...(inicio ? { fechaInicio: inicio } : {}),
                ...(fin ? { fechaFin: fin } : {}),
            }
            const data = await reportesApi.getUsoPorRol(params)
            setReporte(data)
            setFiltrosAplicados({ fechaInicio: inicio, fechaFin: fin })
        } catch (e: unknown) {
            const mensaje = isAxiosError<{ message?: string }>(e)
                ? e.response?.data?.message
                : undefined
            setError(mensaje || 'No se pudo cargar el reporte de uso por rol.')
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargarReporte('', '')
    }, [cargarReporte])

    const formatoNumero = (valor: number) =>
        new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(valor)

    const formatoFecha = (valor: string) => {
        if (!valor) return ''
        const [anio, mes, dia] = valor.split('-')
        return `${dia}/${mes}/${anio}`
    }

    const abrirSelectorFecha = (input: HTMLInputElement | null) => {
        input?.focus()
        try {
            input?.showPicker?.()
        } catch {
            return
        }
    }

    const fechaNombreArchivo = () => new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Bogota',
    }).format(new Date())

    const exportarPdf = async () => {
        const periodo = filtrosAplicados.fechaInicio || filtrosAplicados.fechaFin
            ? `Periodo: ${formatoFecha(filtrosAplicados.fechaInicio) || 'Sin fecha inicio'} - ${formatoFecha(filtrosAplicados.fechaFin) || 'Sin fecha fin'}`
            : 'Periodo: Todos los periodos'

        try {
            setError('')
            await exportarReportePdf({
                title: 'Reporte de uso de la plataforma por rol',
                subtitle: 'Usuarios activos, sesiones y mensajes por rol',
                fileName: `Reporte de Uso por Rol - ${fechaNombreArchivo()}.pdf`,
                metadata: [
                    periodo,
                    `Estudiantes activos: ${formatoNumero(reporte.estudiantesActivos)}  ·  Tutores activos: ${formatoNumero(reporte.tutoresActivos)}  ·  Administradores activos: ${formatoNumero(reporte.adminsActivos)}`,
                    `Sesiones creadas: ${formatoNumero(reporte.totalSesionesCreadas)}  ·  Mensajes enviados: ${formatoNumero(reporte.totalMensajesEnviados)}`,
                ],
                columns: columnas,
                rows: reporte.metricasPorRol.map((metrica) => [
                    etiquetaRol[metrica.rol] ?? metrica.rol,
                    formatoNumero(metrica.usuariosActivos),
                    formatoNumero(metrica.sesiones),
                    formatoNumero(metrica.mensajesEnviados),
                ]),
            })
        } catch {
            setError('No se pudo exportar el PDF.')
        }
    }

    const tarjetas = [
        { label: 'Estudiantes activos', valor: reporte.estudiantesActivos, icon: <GraduationCap className="w-5 h-5" /> },
        { label: 'Tutores activos', valor: reporte.tutoresActivos, icon: <Users className="w-5 h-5" /> },
        { label: 'Sesiones creadas', valor: reporte.totalSesionesCreadas, icon: <Calendar className="w-5 h-5" /> },
        { label: 'Mensajes enviados', valor: reporte.totalMensajesEnviados, icon: <MessageSquare className="w-5 h-5" /> },
    ]

    const sinDatos = !cargando && reporte.metricasPorRol.every((m) => m.usuariosActivos === 0 && m.sesiones === 0 && m.mensajesEnviados === 0)

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Uso de la Plataforma por Rol</h1>
                        <p className="text-slate-500 mt-2">Usuarios activos, sesiones y mensajes diferenciados por rol, con actividad semanal.</p>
                    </div>
                </div>

                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
                            <div onClick={() => abrirSelectorFecha(fechaInicioRef.current)} className="cursor-pointer">
                                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">Fecha inicio</label>
                                <Input ref={fechaInicioRef} type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="cursor-pointer" />
                            </div>
                            <div onClick={() => abrirSelectorFecha(fechaFinRef.current)} className="cursor-pointer">
                                <label className="text-sm font-medium mb-1 block text-slate-700 dark:text-slate-300">Fecha fin</label>
                                <Input ref={fechaFinRef} type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="cursor-pointer" />
                            </div>
                            <Button onClick={() => cargarReporte(fechaInicio, fechaFin)} disabled={cargando} className="flex items-center gap-2">
                                {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Aplicar filtros
                            </Button>
                            <Button onClick={exportarPdf} disabled={cargando || sinDatos} className="flex items-center gap-2">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {tarjetas.map((tarjeta) => (
                        <Card key={tarjeta.label} className="shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-500">{tarjeta.label}</span>
                                    <span className="text-primary">{tarjeta.icon}</span>
                                </div>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                    {cargando ? '—' : formatoNumero(tarjeta.valor)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="mb-4 flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Actividad semanal por rol</h2>
                        </div>
                        {cargando ? (
                            <div className="flex h-64 items-center justify-center text-slate-500">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                        ) : (
                            <GraficoActividadSemanal datos={reporte.actividadSemanal} />
                        )}
                    </CardContent>
                </Card>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Métricas por rol</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Rol</th>
                                    <th className="px-6 py-4 font-semibold text-right">Usuarios activos</th>
                                    <th className="px-6 py-4 font-semibold text-right">Sesiones</th>
                                    <th className="px-6 py-4 font-semibold text-right">Mensajes enviados</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                            <div className="inline-flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                Cargando reporte...
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!cargando && reporte.metricasPorRol.map((metrica) => (
                                    <tr key={metrica.rol} className="border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{etiquetaRol[metrica.rol] ?? metrica.rol}</td>
                                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{formatoNumero(metrica.usuariosActivos)}</td>
                                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{formatoNumero(metrica.sesiones)}</td>
                                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{formatoNumero(metrica.mensajesEnviados)}</td>
                                    </tr>
                                ))}

                                {!cargando && reporte.metricasPorRol.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                            No hay datos para el período seleccionado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
