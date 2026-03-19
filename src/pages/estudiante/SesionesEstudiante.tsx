import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { sesionApi } from '../../api/sesionApi'
import type { SesionResponse } from '../../types'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function SesionesEstudiante() {
    const [sesiones, setSesiones] = useState<SesionResponse[]>([])

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

    const eventos = sesiones.map((s) => ({
        id: s.id.toString(),
        title: `Tutoría con ${s.nombreTutor}`,
        start: `${s.fecha}T${s.horaInicio}`,
        end: `${s.fecha}T${s.horaFin}`,
        extendedProps: { estado: s.estado },
        backgroundColor:
            s.estado === 'APROBADA'
                ? '#10B981' // Green
                : s.estado === 'CANCELADA'
                    ? '#EF4444' // Red
                    : '#F59E0B', // Yellow/Orange
        textColor: s.estado === 'PENDIENTE' ? '#1c1917' : '#ffffff',
        borderColor: 'transparent',
    }))

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
        </DashboardLayout>
    )
}
