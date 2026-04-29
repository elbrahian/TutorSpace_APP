import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { sesionApi } from '../../api/sesionApi'
import type { SesionResponse, DisponibilidadResponse } from '../../types'
import { Calendar, Clock, ArrowRight, CheckCircle, ShieldCheck, MessageSquare } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'
import { tutorApi } from '../../api/tutorApi'
import { Button } from '../../components/ui/button'

export default function TutorDashboard() {
    const [sesionesDia, setSesionesDia] = useState<SesionResponse[]>([])
    const [franjas, setFranjas] = useState<DisponibilidadResponse[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dataSesiones, dataFranjas] = await Promise.all([
                    sesionApi.getSesionesTutor(),
                    tutorApi.getDisponibilidad()
                ])

                // Próximas sesiones (Aprobadas o Pendientes), ordenadas por fecha
                const proximas = dataSesiones
                    .filter(s => s.estado !== 'CANCELADA')
                    .sort((a, b) => new Date(`${a.fecha}T${a.horaInicio}`).getTime() - new Date(`${b.fecha}T${b.horaInicio}`).getTime())
                    .slice(0, 5)

                setSesionesDia(proximas)
                setFranjas(dataFranjas)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Panel de Tutor</h1>
                    <p className="text-slate-500 text-sm md:text-base">Gestiona tu disponibilidad, solicitudes y agenda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/tutor/disponibilidad" className="block group">
                        <Card className="h-full hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
                            <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                                    <Clock className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Mi Disponibilidad</h3>
                                <p className="text-slate-500 text-center text-sm">
                                    Configura tus franjas horarias libres para que los estudiantes puedan ver tus horarios.
                                </p>
                                <div className="text-primary text-sm font-medium flex items-center gap-1 mt-2">
                                    Gestionar horarios <ArrowRight className="w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/tutor/sesiones" className="block group">
                        <Card className="h-full hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
                            <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                                    <Calendar className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Mis Sesiones</h3>
                                <p className="text-slate-500 text-center text-sm">
                                    Revisa tu calendario completo, aprueba/rechaza solicitudes y agenda nuevas tutorías.
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
                                    Las sesiones se agendan desde el chat con cada estudiante.
                                </p>
                                <div className="text-primary text-sm font-medium flex items-center gap-1 mt-2">
                                    Ver calendario <ArrowRight className="w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Tu Disponibilidad Actual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8 text-slate-500">Cargando...</div>
                            ) : franjas.length === 0 ? (
                                <div className="text-center p-8 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                                    No has configurado ninguna franja de disponibilidad. Los estudiantes no podrán agendarte.
                                    <div className="mt-4">
                                        <Link to="/tutor/disponibilidad" className="text-primary hover:underline font-medium text-sm">
                                            Configurar disponibilidad ahora
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {franjas.map(f => (
                                        <div key={f.id} className="flex justify-between items-center p-4 border border-slate-200 dark:border-slate-800/60 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:border-primary/40 dark:hover:border-primary/40 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 mb-1">{f.dia}</span>
                                                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4" /> {f.horaInicio.slice(0,5)} a {f.horaFin.slice(0,5)}
                                                </span>
                                            </div>
                                            <span className={`px-2.5 py-1 text-xs uppercase font-extrabold tracking-wider rounded-md border ${
                                              f.estado === 'DISPONIBLE' ? 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground focus:ring-0' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                            }`}>
                                                <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                                                {f.estado}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Tus Sesiones Programadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8 text-slate-500">Cargando...</div>
                            ) : sesionesDia.length === 0 ? (
                                <div className="space-y-4">
                                    <div className="text-center p-6 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                                        No tienes sesiones programadas próximamente.
                                    </div>
                                    {/* Bug 3: Banner informativo para guiar al tutor */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10">
                                        <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
                                        <div className="flex-1 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">¿Quieres agendar una sesión?</span>{' '}
                                            Ve al Chat con el estudiante y usa el botón <strong>"Agendar Sesión"</strong> desde la conversación.
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => navigate('/tutor/chat')} className="shrink-0 border-primary/30 text-primary hover:bg-primary/10">
                                            Ir al Chat
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sesionesDia.map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-4 border border-slate-200 dark:border-slate-800/60 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:border-primary/40 dark:hover:border-primary/40 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center text-primary font-bold text-lg shadow-inner border border-primary/20">
                                                    {s.nombreEstudiante.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                                                        Estudiante: {s.nombreEstudiante}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border border-transparent">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(s.fecha)}, {s.horaInicio.slice(0, 5)} - {s.horaFin.slice(0, 5)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                {s.estado === 'APROBADA' && (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                        <CheckCircle className="w-4 h-4" /> Aprobada
                                                    </span>
                                                )}
                                                {s.estado === 'PENDIENTE' && (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                                        <Clock className="w-4 h-4" /> Pendiente
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
