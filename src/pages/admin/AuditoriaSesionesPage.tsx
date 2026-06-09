import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Search, RotateCcw, FileDown } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { auditoriaApi } from '../../api/auditoriaApi'
import type { AuditoriaSesionResponse } from '../../types'
import { exportarReportePdf } from '../../utils/exportarReportePdf'
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '../../components/ui/card'

const estadoBadge = (estado: string) => {
    const estilos: Record<string, string> = {
        APROBADA:
            'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
        PENDIENTE:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
        CANCELADA:
            'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    }

    return (
        <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                estilos[estado] ??
                'bg-slate-100 text-slate-600'
            }`}
        >
            {estado}
        </span>
    )
}

const AuditoriaSesionesPage = () => {

    const [estadoAnterior, setEstadoAnterior] = useState('')
    const [estadoNuevo, setEstadoNuevo] = useState('')
    const [tutor, setTutor] = useState('')
    const [estudiante, setEstudiante] = useState('')

    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')

    const [auditorias, setAuditorias] = useState<AuditoriaSesionResponse[]>([])
    const [loading, setLoading] = useState(false)

    const fetchAuditorias = async (filtros?: {
        estadoAnterior?: string
        estadoNuevo?: string
        tutor?: string
        estudiante?: string
    }) => {

        try {

            setLoading(true)

            const response =
                await auditoriaApi.getAuditoriaSesiones({

                    estadoAnterior:
                        filtros?.estadoAnterior || undefined,

                    estadoNuevo:
                        filtros?.estadoNuevo || undefined,

                    tutor:
                        filtros?.tutor || undefined,

                    estudiante:
                        filtros?.estudiante || undefined,
                })

            setAuditorias(response.content)

        } catch (error) {

            console.error(error)

        } finally {

            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAuditorias()
    }, [])

    const buscar = () => {

        fetchAuditorias({
            estadoAnterior,
            estadoNuevo,
            tutor,
            estudiante
        })
    }

    const limpiar = () => {

        setEstadoAnterior('')
        setEstadoNuevo('')
        setTutor('')
        setEstudiante('')

        setFechaInicio('')
        setFechaFin('')

        fetchAuditorias()
    }

    const auditoriasFiltradas = auditorias.filter(item => {

        const fechaRegistro = new Date(item.fechaCambio)

        if (fechaInicio) {

            const inicio = new Date(fechaInicio)
            inicio.setHours(0, 0, 0, 0)

            if (fechaRegistro < inicio) {
                return false
            }
        }

        if (fechaFin) {

            const fin = new Date(fechaFin)
            fin.setHours(23, 59, 59, 999)

            if (fechaRegistro > fin) {
                return false
            }
        }

        return true
    })

    const exportarPdf = async () => {

        await exportarReportePdf({

            title: 'Auditoría de Sesiones',

            fileName: 'auditoria-sesiones.pdf',

            subtitle: 'Historial de cambios de sesiones',

            columns: [
                { header: 'Sesión' },
                { header: 'Tutor' },
                { header: 'Estudiante' },
                { header: 'Estado Anterior' },
                { header: 'Estado Nuevo' },
                { header: 'Fecha' }
            ],

            rows: auditoriasFiltradas.map(item => [

                item.sesionId,
                item.tutor,
                item.estudiante,
                item.estadoAnterior,
                item.estadoNuevo,
                item.fechaCambio

            ])
        })
    }

    return (

        <DashboardLayout>

            <div className="space-y-6">

                {/* Header */}

                <div>

                    <h1 className="text-3xl font-bold">
                        Auditoría de Sesiones
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        Consulta y exporta el historial de cambios de las sesiones.
                    </p>

                </div>

                {/* Filtros */}

                <Card>

                    <CardHeader>

                        <CardTitle>
                            Filtros
                        </CardTitle>

                    </CardHeader>

                    <CardContent>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

                            <select
                                value={estadoAnterior}
                                onChange={(e) => setEstadoAnterior(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            >
                                <option value="">Estado anterior</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="APROBADA">Aprobada</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select>

                            <select
                                value={estadoNuevo}
                                onChange={(e) => setEstadoNuevo(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            >
                                <option value="">Estado nuevo</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="APROBADA">Aprobada</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select>

                            <input
                                value={tutor}
                                onChange={(e) => setTutor(e.target.value)}
                                placeholder="Tutor"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />

                            <input
                                value={estudiante}
                                onChange={(e) => setEstudiante(e.target.value)}
                                placeholder="Estudiante"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />

                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />

                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2"
                            />

                        </div>

                        <div className="flex flex-wrap gap-3 mt-6">

                            <Button
                                onClick={buscar}
                                className="flex items-center gap-2"
                            >
                                <Search size={18} />
                                Aplicar Filtros
                            </Button>

                            <Button
                                variant="outline"
                                onClick={limpiar}
                                className="flex items-center gap-2"
                            >
                                <RotateCcw size={18} />
                                Limpiar
                            </Button>

                            <Button
                                onClick={exportarPdf}
                                className="flex items-center gap-2"
                            >
                                <FileDown size={18} />
                                Exportar PDF
                            </Button>

                        </div>

                    </CardContent>

                </Card>

                {/* Resultados */}

                <Card>

                    <CardHeader>

                        <CardTitle>
                            Historial de Sesiones
                        </CardTitle>

                    </CardHeader>

                    <CardContent className="p-0">

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-muted">

                                    <tr>

                                        <th className="px-4 py-3 text-left">
                                            Sesión
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                            Tutor
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                            Estudiante
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                            Estado Anterior
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                            Estado Nuevo
                                        </th>

                                        <th className="px-4 py-3 text-left">
                                            Fecha
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan={6}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                Cargando...
                                            </td>

                                        </tr>

                                    ) : auditoriasFiltradas.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={6}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No hay registros disponibles.
                                            </td>

                                        </tr>

                                    ) : (

                                        auditoriasFiltradas.map(item => (

                                            <tr
                                                key={item.sesionId + item.fechaCambio}
                                                className="border-t"
                                            >

                                                <td className="px-4 py-3">
                                                    {item.sesionId}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {item.tutor}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {item.estudiante}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {estadoBadge(item.estadoAnterior)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {estadoBadge(item.estadoNuevo)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {new Date(item.fechaCambio).toLocaleString()}
                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </CardContent>

                </Card>

            </div>

        </DashboardLayout>
    )
}

export default AuditoriaSesionesPage