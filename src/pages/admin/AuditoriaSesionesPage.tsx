import { useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Search, RotateCcw, FileDown } from 'lucide-react'
import { auditoriaApi } from '../../api/auditoriaApi'
import type {AuditoriaSesionResponse} from '../../types'
import {exportarReportePdf} from '../../utils/exportarReportePdf'

const AuditoriaSesionesPage = () => {

    const [estadoAnterior, setEstadoAnterior] = useState('')
    const [estadoNuevo, setEstadoNuevo] = useState('')
    const [tutor, setTutor] = useState('')
    const [estudiante, setEstudiante] = useState('')
    const [auditorias, setAuditorias] = useState<AuditoriaSesionResponse[]>([])
    const [loading, setLoading] = useState(false)

    const buscar = async () => {

    try {

        setLoading(true)

        const response =
            await auditoriaApi.getAuditoriaSesiones({

                estadoAnterior:
                    estadoAnterior || undefined,

                estadoNuevo:
                    estadoNuevo || undefined,

                tutor:
                    tutor || undefined,

                estudiante:
                    estudiante || undefined,
            })

        setAuditorias(
            response.content
        )

    } catch (error) {

        console.error(error)

    } finally {

        setLoading(false)
    }
}

    const limpiar = () => {
        setEstadoAnterior('')
        setEstadoNuevo('')
        setTutor('')
        setEstudiante('')
    }

    const exportarPdf = async () => {

    await exportarReportePdf({

        title:
            'Auditoría de Sesiones',

        fileName:
            'auditoria-sesiones.pdf',

        subtitle:
            'Historial de cambios de sesiones',

        columns: [

            { header: 'Sesión' },

            { header: 'Tutor' },

            { header: 'Estudiante' },

            { header: 'Estado Anterior' },

            { header: 'Estado Nuevo' },

            { header: 'Fecha' }

        ],

        rows: auditorias.map(item => [

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

                    <p className="text-slate-400 mt-2">
                        Consulta y exporta el historial de cambios de las sesiones.
                    </p>
                </div>

                {/* Filtros */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

                    <h2 className="text-lg font-semibold mb-4">
                        Filtros
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <select
                            value={estadoAnterior}
                            onChange={(e) => setEstadoAnterior(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                        >
                            <option value="">Estado anterior</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="APROBADA">Aprobada</option>
                            <option value="CANCELADA">Cancelada</option>
                        </select>

                        <select
                            value={estadoNuevo}
                            onChange={(e) => setEstadoNuevo(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
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
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                        />

                        <input
                            value={estudiante}
                            onChange={(e) => setEstudiante(e.target.value)}
                            placeholder="Estudiante"
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                        />

                    </div>

                    <div className="flex gap-3 mt-6">

                        <button
                            onClick={buscar}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                        >
                            <Search size={18} />
                            Buscar
                        </button>

                        <button
                            onClick={limpiar}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700"
                        >
                            <RotateCcw size={18} />
                            Limpiar
                        </button>

                        <button
                            onClick={exportarPdf}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                            <FileDown size={18} />
                            Exportar PDF
                        </button>

                    </div>

                </div>

                {/* Resultados */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

                    <div className="p-6 border-b border-slate-800">

                        <h2 className="font-semibold">
                            Historial de Sesiones
                        </h2>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-slate-950">

                                <tr>
                                    <th className="px-4 py-3 text-left">Sesión</th>
                                    <th className="px-4 py-3 text-left">Tutor</th>
                                    <th className="px-4 py-3 text-left">Estudiante</th>
                                    <th className="px-4 py-3 text-left">Estado Anterior</th>
                                    <th className="px-4 py-3 text-left">Estado Nuevo</th>
                                    <th className="px-4 py-3 text-left">Fecha</th>
                                </tr>

                            </thead>

                            <tbody>
                                {auditorias.map(item => (

                                    <tr
                                        key={
                                            item.sesionId +
                                            item.fechaCambio
                                        }
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
                                            {item.estadoAnterior}
                                        </td>

                                        <td className="px-4 py-3">
                                            {item.estadoNuevo}
                                        </td>

                                        <td className="px-4 py-3">
                                            {
                                                new Date(
                                                    item.fechaCambio
                                                ).toLocaleString()
                                            }
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </DashboardLayout>
    )
}

export default AuditoriaSesionesPage