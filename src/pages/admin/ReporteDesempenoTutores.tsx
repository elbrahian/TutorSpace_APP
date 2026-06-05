import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, Download, Loader2, RefreshCw, Search } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { reportesApi } from '../../api/reportesApi'
import { exportarReportePdf } from '../../utils/exportarReportePdf'
import type { ReporteDesempenoTutorResponse } from '../../types'

type SortKey = keyof Pick<
    ReporteDesempenoTutorResponse,
    'nombreTutor' | 'totalSesiones' | 'sesionesCompletadas' | 'sesionesCanceladas' | 'porcentajeCancelacion' | 'promedioCalificacion'
>

type SortDirection = 'asc' | 'desc'

const columnas: { key: SortKey; label: string; align?: string }[] = [
    { key: 'nombreTutor', label: 'Tutor' },
    { key: 'totalSesiones', label: 'Total sesiones', align: 'text-right' },
    { key: 'sesionesCompletadas', label: 'Completadas', align: 'text-right' },
    { key: 'sesionesCanceladas', label: 'Canceladas', align: 'text-right' },
    { key: 'porcentajeCancelacion', label: '% cancelación', align: 'text-right' },
    { key: 'promedioCalificacion', label: 'Promedio calificación', align: 'text-right' },
]

export default function ReporteDesempenoTutores() {
    const fechaInicioRef = useRef<HTMLInputElement>(null)
    const fechaFinRef = useRef<HTMLInputElement>(null)
    const [reportes, setReportes] = useState<ReporteDesempenoTutorResponse[]>([])
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [filtrosAplicados, setFiltrosAplicados] = useState({ fechaInicio: '', fechaFin: '' })
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('nombreTutor')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

    const cargarReporte = useCallback(async (inicio: string, fin: string) => {
        try {
            setCargando(true)
            setError('')
            const params = {
                ...(inicio ? { fechaInicio: inicio } : {}),
                ...(fin ? { fechaFin: fin } : {}),
            }
            const data = await reportesApi.getDesempenoTutores(params)
            setReportes(data)
            setFiltrosAplicados({ fechaInicio: inicio, fechaFin: fin })
        } catch (e: unknown) {
            const mensaje = isAxiosError<{ message?: string }>(e)
                ? e.response?.data?.message
                : undefined
            setError(mensaje || 'No se pudo cargar el reporte de desempeño.')
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargarReporte('', '')
    }, [cargarReporte])

    const datosOrdenados = useMemo(() => {
        return [...reportes].sort((a, b) => {
            const valorA = a[sortKey]
            const valorB = b[sortKey]

            if (valorA === null && valorB === null) return 0
            if (valorA === null) return 1
            if (valorB === null) return -1

            if (typeof valorA === 'string' && typeof valorB === 'string') {
                return sortDirection === 'asc'
                    ? valorA.localeCompare(valorB)
                    : valorB.localeCompare(valorA)
            }

            const resultado = Number(valorA) - Number(valorB)
            return sortDirection === 'asc' ? resultado : -resultado
        })
    }, [reportes, sortKey, sortDirection])

    const cambiarOrden = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
            return
        }

        setSortKey(key)
        setSortDirection('asc')
    }

    const iconoOrden = (key: SortKey) => {
        if (sortKey !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        return sortDirection === 'asc'
            ? <ArrowUp className="w-3.5 h-3.5 text-primary" />
            : <ArrowDown className="w-3.5 h-3.5 text-primary" />
    }

    const formatoNumero = (valor: number | null, sufijo = '') => {
        if (valor === null) return 'Sin datos'
        return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(valor)}${sufijo}`
    }

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
                title: 'Reporte de desempeño de tutores',
                subtitle: 'Sesiones, cancelaciones y promedio de calificación',
                fileName: `Reporte de Desempeño de Tutores - ${fechaNombreArchivo()}.pdf`,
                metadata: [periodo],
                columns: columnas.map((columna) => ({
                    header: columna.label,
                    align: columna.align === 'text-right' ? 'right' : 'left',
                })),
                rows: datosOrdenados.map((reporte) => [
                    reporte.nombreTutor,
                    formatoNumero(reporte.totalSesiones),
                    formatoNumero(reporte.sesionesCompletadas),
                    formatoNumero(reporte.sesionesCanceladas),
                    formatoNumero(reporte.porcentajeCancelacion, '%'),
                    formatoNumero(reporte.promedioCalificacion),
                ]),
            })
        } catch {
            setError('No se pudo exportar el PDF.')
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Desempeño de Tutores</h1>
                        <p className="text-slate-500 mt-2">Consulta sesiones, cancelaciones y métricas disponibles por tutor activo.</p>
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
                            <Button onClick={exportarPdf} disabled={cargando || datosOrdenados.length === 0} className="flex items-center gap-2">
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
                                        <th key={columna.key} className={`px-6 py-4 ${columna.align || ''}`}>
                                            <button
                                                type="button"
                                                onClick={() => cambiarOrden(columna.key)}
                                                className={`inline-flex items-center gap-2 font-semibold uppercase ${columna.align === 'text-right' ? 'justify-end w-full' : ''}`}
                                            >
                                                {columna.label}
                                                {iconoOrden(columna.key)}
                                            </button>
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

                                {!cargando && datosOrdenados.map((reporte) => (
                                    <tr key={reporte.tutorId} className="border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{reporte.nombreTutor}</div>
                                            <div className="text-xs text-slate-500">ID {reporte.tutorId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{formatoNumero(reporte.totalSesiones)}</td>
                                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{formatoNumero(reporte.sesionesCompletadas)}</td>
                                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{formatoNumero(reporte.sesionesCanceladas)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center justify-end min-w-16 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                                                {formatoNumero(reporte.porcentajeCancelacion, '%')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{formatoNumero(reporte.promedioCalificacion)}</td>
                                    </tr>
                                ))}

                                {!cargando && datosOrdenados.length === 0 && (
                                    <tr>
                                        <td colSpan={columnas.length} className="px-6 py-10 text-center text-slate-500">
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
