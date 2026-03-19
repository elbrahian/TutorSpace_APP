import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { sesionApi } from '../../api/sesionApi'
import type { SesionResponse, EstadoSesion } from '../../types'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Button } from '../../components/ui/button'

export default function SesionesTutor() {
    const [sesiones, setSesiones] = useState<SesionResponse[]>([])
    const [selectedSesion, setSelectedSesion] = useState<SesionResponse | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        cargarSesiones()
    }, [])

    const cargarSesiones = async () => {
        try {
            const data = await sesionApi.getSesionesTutor()
            setSesiones(data)
        } catch (e) {
            console.error(e)
        }
    }

    const eventos = sesiones.map((s) => ({
        id: s.id.toString(),
        title: `${s.nombreEstudiante}`,
        start: `${s.fecha}T${s.horaInicio}`,
        end: `${s.fecha}T${s.horaFin}`,
        extendedProps: { raw: s },
        backgroundColor:
            s.estado === 'APROBADA'
                ? '#10B981'
                : s.estado === 'CANCELADA'
                    ? '#EF4444'
                    : '#F59E0B',
        textColor: s.estado === 'PENDIENTE' ? '#1c1917' : '#ffffff',
        borderColor: 'transparent',
    }))

    const handleEventClick = (info: any) => {
        setSelectedSesion(info.event.extendedProps.raw)
    }

    const cambiarEstado = async (nuevoEstado: EstadoSesion) => {
        if (!selectedSesion) return
        try {
            setLoading(true)
            await sesionApi.cambiarEstado(selectedSesion.id, nuevoEstado)
            setSelectedSesion(null)
            cargarSesiones()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Calendario de Sesiones</h1>
                        <p className="text-slate-500 mt-2">Visualiza, aprueba o cancela las solicitudes de los estudiantes.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative">

                    <div className="flex gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-sm"></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Aprobada</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm"></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pendiente</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-sm"></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cancelada</span>
                        </div>
                    </div>

                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek'
                        }}
                        events={eventos}
                        eventClick={handleEventClick}
                        height="650px"
                        locale="es"
                    />

                    {/* Modal Overlay / Backdrop for Selected Event */}
                    {selectedSesion && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border dark:border-slate-800">
                                <h3 className="text-lg font-bold mb-4">Detalle de Solicitud</h3>
                                <div className="space-y-3 mb-6">
                                    <p><span className="font-medium text-slate-500 dark:text-slate-400">Estudiante:</span> {selectedSesion.nombreEstudiante}</p>
                                    <p><span className="font-medium text-slate-500 dark:text-slate-400">Fecha:</span> {selectedSesion.fecha}</p>
                                    <p><span className="font-medium text-slate-500 dark:text-slate-400">Horario:</span> {selectedSesion.horaInicio.slice(0, 5)} - {selectedSesion.horaFin.slice(0, 5)}</p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-medium text-slate-500 dark:text-slate-400">Estado actual:</span>
                                        <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-bold uppercase tracking-wider ${selectedSesion.estado === 'APROBADA' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                            selectedSesion.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                                'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                            }`}>
                                            {selectedSesion.estado}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                                    <Button variant="outline" onClick={() => setSelectedSesion(null)}>
                                        Cerrar
                                    </Button>

                                    {selectedSesion.estado === 'PENDIENTE' && (
                                        <>
                                            <Button variant="destructive" onClick={() => cambiarEstado('CANCELADA')} disabled={loading}>
                                                Rechazar
                                            </Button>
                                            <Button onClick={() => cambiarEstado('APROBADA')} disabled={loading}>
                                                Aprobar
                                            </Button>
                                        </>
                                    )}
                                    {selectedSesion.estado === 'APROBADA' && (
                                        <Button variant="destructive" onClick={() => cambiarEstado('CANCELADA')} disabled={loading}>
                                            Cancelar Sesión
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    )
}
