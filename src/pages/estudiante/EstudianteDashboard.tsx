import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { sesionApi } from '../../api/sesionApi'
import { estadisticasApi } from '../../api/estadisticasApi'
import type { EstudianteDashboardStats } from '../../api/estadisticasApi'
import type { SesionResponse } from '../../types'
import { Calendar, Users, ArrowRight, BookOpen, Clock, Star, UserCheck } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'
import { ActividadMensualChart } from '../../components/estudiante/ActividadMensualChart'

function formatearHoras(horas: number): string {
    if (!Number.isFinite(horas)) return '0'
    return Number.isInteger(horas) ? String(horas) : horas.toFixed(1)
}

export default function EstudianteDashboard() {
    const [sesiones, setSesiones] = useState<SesionResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<EstudianteDashboardStats | null>(null)
    const [loadingStats, setLoadingStats] = useState(true)
    const [statsError, setStatsError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSesiones = async () => {
            try {
                const data = await sesionApi.getSesionesEstudiante()
                const lista = Array.isArray(data) ? data : []
                const proximas = lista
                    .filter((s) => s.estado !== 'CANCELADA')
                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                    .slice(0, 5)
                setSesiones(proximas)
            } catch (e) {
                console.error('Error cargando sesiones:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchSesiones()
    }, [])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await estadisticasApi.getEstadisticas()
                setStats(data)
                setStatsError(null)
            } catch (e) {
                console.error('Error cargando estadísticas:', e)
                setStats(null)
                setStatsError('No se pudieron cargar las estadísticas. El backend no respondió (¿está encendido en localhost:8080 o desplegado en Render?).')
            } finally {
                setLoadingStats(false)
            }
        }
        fetchStats()
    }, [])

    const sinDatos = statsError ? '—' : null

    const metricCards = [
        {
            titulo: 'Sesiones completadas',
            valor: sinDatos ?? stats?.totalSesionesCompletadas ?? 0,
            icono: <Calendar className="w-5 h-5 text-primary" />,
        },
        {
            titulo: 'Horas de tutoría',
            valor: sinDatos ?? formatearHoras(stats?.totalHorasTutoria ?? 0),
            icono: <Clock className="w-5 h-5 text-primary" />,
        },
        {
            titulo: 'Materia frecuente',
            valor: sinDatos ?? stats?.materiaMasConsultada ?? 'N/A',
            icono: <BookOpen className="w-5 h-5 text-primary" />,
        },
        {
            titulo: 'Tutor frecuente',
            valor: sinDatos ?? stats?.tutorFrecuente ?? 'N/A',
            icono: <UserCheck className="w-5 h-5 text-primary" />,
        },
    ]

    const actividadMensual = Array.isArray(stats?.actividadMensual) ? stats.actividadMensual : []

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Panel de Estudiante
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base">
                        Bienvenido a TutorSpace. Gestiona tus tutorías académicas.
                    </p>
                </div>

                {loadingStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="pt-6 h-24 bg-slate-100 dark:bg-slate-800" />
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {statsError && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                                {statsError}
                            </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {metricCards.map((card) => (
                                <Card key={card.titulo} className="shadow-sm">
                                    <CardContent className="pt-5 pb-4 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
                                            {card.icono}
                                            {card.titulo}
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                                            {card.valor}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Star className="w-4 h-4 text-primary" />
                            Actividad mensual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingStats ? (
                            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                        ) : statsError ? (
                            <div className="text-center p-6 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                                No se pudo cargar el gráfico. Revisa la consola del navegador (F12 → Network).
                            </div>
                        ) : (
                            <ActividadMensualChart datos={actividadMensual} />
                        )}
                    </CardContent>
                </Card>

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
                                {sesiones.map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center text-primary font-bold">
                                                {(s.nombreTutor ?? '?').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                    Sesión con {s.nombreTutor ?? 'Tutor'}
                                                </p>
                                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(s.fecha)}
                                                    {s.horaInicio && s.horaFin && (
                                                        <> de {s.horaInicio.slice(0, 5)} a {s.horaFin.slice(0, 5)}</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span
                                                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                    s.estado === 'APROBADA'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                        : s.estado === 'PENDIENTE'
                                                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                          : 'bg-red-100 text-red-700'
                                                }`}
                                            >
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
