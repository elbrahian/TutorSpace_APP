import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { AlertCircle, Download, Loader2, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { reportesApi } from '../../api/reportesApi'
import { exportarReportePdf } from '../../utils/exportarReportePdf'
import type { MateriaDemandaResponse, ReporteDemandaResponse } from '../../types'

export default function ReporteDemandaTutores() {
    const fechaInicioRef = useRef<HTMLInputElement>(null)
    const fechaFinRef = useRef<HTMLInputElement>(null)
    const [reporte, setReporte] = useState<ReporteDemandaResponse | null>(null)
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
            const data = await reportesApi.getDemanda(params)
            setReporte(data)
            setFiltrosAplicados({ fechaInicio: inicio, fechaFin: fin })
        } catch (e: unknown) {
            const mensaje = isAxiosError<{ message?: string }>(e)
                ? e.response?.data?.message
                : undefined
            setError(mensaje || 'No se pudo cargar el reporte de oferta y demanda.')
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargarReporte('', '')
    }, [cargarReporte])

    const formatoFecha = (valor: string) => {
        if (!valor) return ''
        const [anio, mes, dia] = valor.split('-')
        return `${dia}/${mes}/${anio}`
    }

    const abrirSelectorFecha = (input: HTMLInputElement | null) => {
        input?.focus()
        try { input?.showPicker?.() } catch { return }
    }

    const fechaNombreArchivo = () => new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Bogota',
    }).format(new Date())

    const exportarPdf = async () => {
        if (!reporte) return
        const periodo = filtrosAplicados.fechaInicio || filtrosAplicados.fechaFin
            ? `Periodo: ${formatoFecha(filtrosAplicados.fechaInicio) || 'Sin fecha inicio'} - ${formatoFecha(filtrosAplicados.fechaFin) || 'Sin fecha fin'}`
            : 'Periodo: Todos los periodos'
        try {
            setError('')
            await exportarReportePdf({
                title: 'Reporte de Oferta y Demanda de Tutorías',
                subtitle: 'Sesiones solicitadas vs tutores activos por materia',
                fileName: `Reporte de Oferta y Demanda - ${fechaNombreArchivo()}.pdf`,
                metadata: [periodo],
                columns: [
                    { header: 'Materia' },
                    { header: 'Sesiones Solicitadas', align: 'right' },
                    { header: 'Tutores Disponibles', align: 'right' },
                    { header: 'Tasa de Cobertura', align: 'right' },
                ],
                rows: reporte.materias.map((item) => [
                    item.materia,
                    item.sesionesSolicitadas,
                    item.tutoresDisponibles,
                    item.tasaCobertura === null ? 'Sin tutores' : item.tasaCobertura,
                ]),
            })
        } catch {
            setError('No se pudo exportar el PDF.')
        }
    }

    const materias = reporte?.materias ?? []
    const top5Mayor = reporte?.top5MayorDemanda ?? []
    const top5Menor = reporte?.top5MenorDemanda ?? []

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Oferta y Demanda</h1>
                        <p className="text-slate-500 mt-2">Compara sesiones solicitadas frente a tutores activos disponibles por materia.</p>
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
                            <Button onClick={exportarPdf} disabled={cargando || materias.length === 0} className="flex items-center gap-2">
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

                {!cargando && (top5Mayor.length > 0 || top5Menor.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <TopMaterias title="Top 5 — Mayor Demanda" items={top5Mayor} icon={<TrendingUp className="w-4 h-4 text-primary" />} />
                        <TopMaterias title="Top 5 — Menor Demanda" items={top5Menor} icon={<TrendingDown className="w-4 h-4 text-slate-500" />} />
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Materia</th>
                                <th className="px-6 py-4 text-right font-semibold">Sesiones Solicitadas</th>
                                <th className="px-6 py-4 text-right font-semibold">Tutores Disponibles</th>
                                <th className="px-6 py-4 text-right font-semibold">Tasa de Cobertura</th>
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
                            {!cargando && materias.map((item) => (
                                <tr key={item.materia} className="border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{item.materia}</td>
                                    <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{item.sesionesSolicitadas}</td>
                                    <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{item.tutoresDisponibles}</td>
                                    <td className="px-6 py-4 text-right">
                                        <TasaBadge tasa={item.tasaCobertura} />
                                    </td>
                                </tr>
                            ))}
                            {!cargando && materias.length === 0 && (
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

function TasaBadge({ tasa }: { tasa: number | null }) {
    if (tasa === null) {
        return (
            <span className="inline-flex items-center justify-end min-w-20 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-medium text-xs">
                Sin tutores
            </span>
        )
    }
    const texto = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(tasa)
    if (tasa < 1) {
        return (
            <span className="inline-flex items-center justify-end min-w-20 px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-medium text-xs">
                {texto}
            </span>
        )
    }
    return (
        <span className="inline-flex items-center justify-end min-w-20 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium text-xs">
            {texto}
        </span>
    )
}

function TopMaterias({ title, items, icon }: { title: string; items: MateriaDemandaResponse[]; icon: ReactNode }) {
    return (
        <Card className="shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                    {icon}
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{title}</h2>
                </div>
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={item.materia} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
                                <span className="text-sm text-slate-800 dark:text-slate-200">{item.materia}</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.sesionesSolicitadas} ses.</span>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-2">Sin datos</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}