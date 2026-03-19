import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { tutorApi } from '../../api/tutorApi'
import type { MateriaResponse } from '../../types'
import { BookOpen, BookX, Loader2 } from 'lucide-react'

export default function MisMateriasPage() {
    const [materias, setMaterias] = useState<MateriaResponse[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                setCargando(true)
                const perfil = await tutorApi.getPerfil()
                setMaterias(perfil.materias)
            } catch (e) {
                console.error(e)
                setError('No se pudo cargar el perfil. Asegúrate de que el endpoint GET /tutor/perfil esté disponible en el backend.')
            } finally {
                setCargando(false)
            }
        }
        fetchMaterias()
    }, [])

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Mis Materias</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Materias asignadas por el administrador. Para cambios, contacta al administrador.
                    </p>
                </div>

                {cargando ? (
                    <div className="flex justify-center py-20 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                ) : materias.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <BookX className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-700" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Sin materias asignadas</p>
                        <p className="text-sm max-w-xs">
                            No tienes materias asignadas aún. Contacta al administrador para que te asigne materias.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {materias.map((materia) => (
                            <div
                                key={materia.id}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                            {materia.nombre}
                                        </h3>
                                        <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {materia.codigo}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
