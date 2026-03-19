import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { tutorApi } from '../../api/tutorApi'
import type { MateriaResponse } from '../../types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { BookOpen, Plus } from 'lucide-react'

const materiaSchema = z.object({
    nombre: z.string().min(2, 'Obligatorio'),
    codigo: z.string().min(2, 'Obligatorio'),
})

type MateriaForm = z.infer<typeof materiaSchema>

export default function GestionMaterias() {
    const [materias, setMaterias] = useState<MateriaResponse[]>([])
    const [isCreating, setIsCreating] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<MateriaForm>({
        resolver: zodResolver(materiaSchema)
    })

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const data = await tutorApi.getMaterias()
            setMaterias(data)
        } catch (e) {
            console.error(e)
        }
    }

    const onSubmit = async (data: MateriaForm) => {
        try {
            await tutorApi.createMateria(data)
            setIsCreating(false)
            reset()
            cargarDatos()
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Catálogo de Materias</h1>
                        <p className="text-slate-500 mt-2">Administra las asignaturas disponibles en la plataforma.</p>
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Crear Materia
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materias.map(m => (
                        <div key={m.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{m.nombre}</h3>
                                <p className="text-sm font-mono text-slate-500 mt-1">CODE: {m.codigo}</p>
                            </div>
                        </div>
                    ))}

                    {materias.length === 0 && (
                        <div className="col-span-full text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                            <p className="text-slate-500">El catálogo de materias está vacío.</p>
                        </div>
                    )}
                </div>

                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-sm w-full p-6">
                            <h3 className="text-xl font-bold mb-4">Nueva Materia</h3>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Nombre de Asignatura</label>
                                    <Input {...register('nombre')} placeholder="Cálculo Diferencial" className={errors.nombre ? 'border-red-500' : ''} />
                                    {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Código</label>
                                    <Input {...register('codigo')} placeholder="CAL-01" className={errors.codigo ? 'border-red-500' : ''} />
                                    {errors.codigo && <p className="text-xs text-red-500 mt-1">{errors.codigo.message}</p>}
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                                    <Button type="submit">Guardar</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
