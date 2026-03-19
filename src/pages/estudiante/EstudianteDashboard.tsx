import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { sesionApi } from '../../api/sesionApi'
import type { SesionResponse } from '../../types'
import { Calendar, Users, ArrowRight } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'

export default function EstudianteDashboard() {
    const [sesiones, setSesiones] = useState<SesionResponse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSesiones = async () => {
            try {
                const data = await sesionApi.getSesionesEstudiante()
                // Mostrar próximas sesiones aprobadas o pendientes ordenadas por fecha
                const proximas = data
                    .filter(s => s.estado !== 'CANCELADA')
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                    .slice(0, 5)
                setSesiones(proximas)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchSesiones()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Panel de Estudiante</h1>
                    <p className="text-slate-500 mt-2">Bienvenido a TutorSpace. Gestiona tus tutorías académicas de forma sencilla.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/estudiante/buscar" className="block group">
                        <Card className="h-full hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
                            <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Buscar Tutores</h3>
                                <p className="text-slate-500 text-center text-sm">
                                    Encuentra al tutor ideal para la materia que necesitas reforzar o adelantar.
                                </p>
                                <div className="text-primary text-sm font-medium flex items-center gap-1 mt-2">
                                    Ver tutores disponibles <ArrowRight className="w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/estudiante/sesiones" className="block group">
                        <Card className="h-full hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
                            <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                                    <Calendar className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Mis Sesiones</h3>
                                <p className="text-slate-500 text-center text-sm">
                                    Revisa tu calendario, el estado de tus solicitudes y únete a los encuentros.
                                </p>
                                <div className="text-primary text-sm font-medium flex items-center gap-1 mt-2">
                                    Ir a mi calendario <ArrowRight className="w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Próximas Sesiones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8 text-slate-500">Cargando...</div>
                        ) : sesiones.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                                No tienes sesiones próximas programadas.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sesiones.map(s => (
                                    <div key={s.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center text-primary font-bold">
                                                {s.nombreTutor.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">Sesión con {s.nombreTutor}</p>
                                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(s.fecha)} de {s.horaInicio.slice(0, 5)} a {s.horaFin.slice(0, 5)}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.estado === 'APROBADA' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                                                s.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {s.estado}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
