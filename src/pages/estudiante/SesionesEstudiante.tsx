import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { sesionApi } from '../../api/sesionApi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import type { SesionResponse } from '../../types'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Calendar as CalendarIcon, Clock, User, Info } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'

export default function SesionesEstudiante() {
    const [sesiones, setSesiones] = useState<SesionResponse[]>([])
    const [selectedSesion, setSelectedSesion] = useState<SesionResponse | null>(null)

    useEffect(() => {
        const fetchSesiones = async () => {
            try {
                const data = await sesionApi.getSesionesEstudiante()
                setSesiones(data)
            } catch (e) {
                console.error(e)
            }
        }
        fetchSesiones()
    }, [])

    const eventos = sesiones.map((s) => {
        const estado = s.estado.toUpperCase()
        return {
            id: s.id.toString(),
            title: `Tutoría: ${s.nombreTutor}`,
            start: `${s.fecha}T${s.horaInicio}`,
            end: `${s.fecha}T${s.horaFin}`,
            extendedProps: { raw: s },
            backgroundColor:
                estado === 'APROBADA'
                    ? '#10B981' // Green
                    : estado === 'CANCELADA'
                        ? '#EF4444' // Red
                        : '#F59E0B', // Yellow/Orange
            textColor: estado === 'PENDIENTE' ? '#1c1917' : '#ffffff',
            borderColor: 'transparent',
            display: 'block' // Asegura que se vea el fondo en vista de mes
        }
    })

    const handleEventClick = (info: any) => {
        setSelectedSesion(info.event.extendedProps.raw)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Mis Sesiones</h1>
                    <p className="text-slate-500 mt-2">Visualiza tu horario y el estado de tus encuentros académicos.</p>
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

                    <div className="fullcalendar-custom">
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
                            height="600px"
                            locale="es"
                            buttonText={{
                                today: 'Hoy',
                                month: 'Mes',
                                week: 'Semana'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal de Detalle para el Estudiante */}
            {selectedSesion && (
                <Dialog open={!!selectedSesion} onOpenChange={() => setSelectedSesion(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" /> Detalles de la Sesión
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tutor</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedSesion.nombreTutor}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CalendarIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDate(selectedSesion.fecha)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horario</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {selectedSesion.horaInicio.slice(0, 5)} - {selectedSesion.horaFin.slice(0, 5)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 flex justify-center mt-0.5">
                                    <div className={`w-3 h-3 rounded-full mt-1 ${
                                        selectedSesion.estado === 'APROBADA' ? 'bg-emerald-500' :
                                        selectedSesion.estado === 'CANCELADA' ? 'bg-red-500' : 'bg-amber-500'
                                    }`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</p>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border mt-1 ${
                                        selectedSesion.estado === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                        selectedSesion.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                        'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                    }`}>
                                        {selectedSesion.estado}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={() => setSelectedSesion(null)}>Cerrar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </DashboardLayout>
    )
}
