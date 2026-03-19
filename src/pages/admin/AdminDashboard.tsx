import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Users, BookOpen, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Panel de Administrador</h1>
                    <p className="text-slate-500 mt-2">Gestiona los profesores tutores y el catálogo de materias de la plataforma.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/admin/tutores" className="block group">
                        <Card className="h-full hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
                            <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Gestión de Tutores</h3>
                                <p className="text-slate-500 text-center text-sm">
                                    Crea nuevas cuentas de tutor, actívalas, desactívalas y asigna materias a cada docente.
                                </p>
                                <div className="text-primary text-sm font-medium flex items-center gap-1 mt-2">
                                    Administrar tutores <ArrowRight className="w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/admin/materias" className="block group">
                        <Card className="h-full hover:border-primary/50 transition-colors shadow-sm cursor-pointer">
                            <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">Gestión de Materias</h3>
                                <p className="text-slate-500 text-center text-sm">
                                    Administra el catálogo de asignaturas disponibles para brindar y recibir tutorías.
                                </p>
                                <div className="text-primary text-sm font-medium flex items-center gap-1 mt-2">
                                    Administrar materias <ArrowRight className="w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}
