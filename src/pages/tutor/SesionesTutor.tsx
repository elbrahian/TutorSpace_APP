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

    const eventos = sesiones.map((s) => {
        const estado = s.estado.toUpperCase()
        return {
            id: s.id.toString(),
            title: `${s.nombreEstudiante}`,
            start: `${s.fecha}T${s.horaInicio}`,
            end: `${s.fecha}T${s.horaFin}`,
            extendedProps: { raw: s },
            backgroundColor:
                estado === 'APROBADA'
                    ? '#10B981'
                    : estado === 'CANCELADA'
                        ? '#EF4444'
                        : '#F59E0B',
            textColor: estado === 'PENDIENTE' ? '#1c1917' : '#ffffff',
            borderColor: 'transparent',
            display: 'block'
        }
    })

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
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Calendario de Sesiones</h1>
                        <p className="text-slate-500 mt-1 text-sm md:text-base">Visualiza, aprueba o cancela las solicitudes de los estudiantes.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
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

                    <div className="calendar-container overflow-x-auto">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView={window.innerWidth < 768 ? 'dayGridMonth' : 'dayGridMonth'}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: window.innerWidth < 768 ? '' : 'dayGridMonth,timeGridWeek'
                            }}
                            events={eventos}
                            eventClick={handleEventClick}
                            height="auto"
                            contentHeight="600px"
                            locale="es"
                        />
                    </div>

                    {/* Modal Overlay / Backdrop for Selected Event */}
                    {selectedSesion && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 border dark:border-slate-800">
                                <h3 className="text-lg font-bold mb-4">Detalle de Solicitud</h3>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estudiante</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedSesion.nombreEstudiante}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedSesion.fecha}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horario</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedSesion.horaInicio.slice(0, 5)} - {selectedSesion.horaFin.slice(0, 5)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <div className={`w-3 h-3 rounded-full mt-0.5 ${selectedSesion.estado === 'APROBADA' ? 'bg-emerald-500' : selectedSesion.estado === 'CANCELADA' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado actual</p>
                                            <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider mt-1 ${selectedSesion.estado === 'APROBADA' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                                selectedSesion.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                                    'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                                }`}>
                                                {selectedSesion.estado}
                                            </span>
                                        </div>
                                    </div>
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
