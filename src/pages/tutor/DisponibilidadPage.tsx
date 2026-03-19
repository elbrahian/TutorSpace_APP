import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { tutorApi } from '../../api/tutorApi'
import type { DisponibilidadResponse } from '../../types'
import { Plus, Trash2, Clock } from 'lucide-react'

const disponibilidadSchema = z.object({
    dia: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']),
    horaInicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora de inicio inválida (HH:MM)'),
    horaFin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora de fin inválida (HH:MM)'),
})

type DisponibilidadForm = z.infer<typeof disponibilidadSchema>

export default function DisponibilidadPage() {
    const [franjas, setFranjas] = useState<DisponibilidadResponse[]>([])
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<DisponibilidadForm>({
        resolver: zodResolver(disponibilidadSchema)
    })

    useEffect(() => {
        cargarFranjas()
    }, [])

    const cargarFranjas = async () => {
        try {
            const data = await tutorApi.getDisponibilidad()
            setFranjas(data)
        } catch (e) {
            console.error(e)
        }
    }

    const onSubmit = async (data: DisponibilidadForm) => {
        try {
            setLoading(true)
            await tutorApi.crearDisponibilidad({
                dia: data.dia,
                horaInicio: `${data.horaInicio}:00`,
                horaFin: `${data.horaFin}:00`
            })
            reset()
            cargarFranjas()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const eliminar = async (id: number) => {
        try {
            await tutorApi.eliminarDisponibilidad(id)
            cargarFranjas()
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Disponibilidad</h1>
                    <p className="text-slate-500 mt-2">Agrega las franjas horarias en las que puedes impartir tutorías.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary" /> Nueva Franja
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Día de la semana</label>
                                    <select
                                        {...register('dia')}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="LUNES">Lunes</option>
                                        <option value="MARTES">Martes</option>
                                        <option value="MIERCOLES">Miércoles</option>
                                        <option value="JUEVES">Jueves</option>
                                        <option value="VIERNES">Viernes</option>
                                        <option value="SABADO">Sábado</option>
                                        <option value="DOMINGO">Domingo</option>
                                    </select>
                                    {errors.dia && <p className="text-xs text-red-500">{errors.dia.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hora Inicio</label>
                                        <Input type="time" {...register('horaInicio')} className={errors.horaInicio ? 'border-red-500' : ''} />
                                        {errors.horaInicio && <p className="text-xs text-red-500">{errors.horaInicio.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hora Fin</label>
                                        <Input type="time" {...register('horaFin')} className={errors.horaFin ? 'border-red-500' : ''} />
                                        {errors.horaFin && <p className="text-xs text-red-500">{errors.horaFin.message}</p>}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full mt-2" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Agregar Franja'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" /> Franjas Actuales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {franjas.length === 0 ? (
                                <div className="p-10 text-center text-slate-500 font-medium">
                                    No has registrado disponibilidad. Serás invisible para los estudiantes.
                                </div>
                            ) : (
                                <>
                                    {/* Vista Móvil: Cards */}
                                    <div className="md:hidden space-y-3 p-4">
                                        {franjas.map((f) => (
                                            <div key={f.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center transition-all hover:border-primary/30">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">{f.dia}</span>
                                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${f.estado === 'DISPONIBLE'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                            : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                                                            }`}>
                                                            {f.estado}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {f.horaInicio.slice(0, 5)} - {f.horaFin.slice(0, 5)}
                                                    </div>
                                                </div>
                                                
                                                {f.estado === 'DISPONIBLE' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => eliminar(f.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-10 w-10 shrink-0"
                                                        title="Eliminar franja"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Vista Desktop: Tabla */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold">Día</th>
                                                    <th className="px-6 py-4 font-semibold">Horario</th>
                                                    <th className="px-6 py-4 font-semibold">Estado</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {franjas.map((f) => (
                                                    <tr key={f.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                        <td className="px-6 py-4 font-medium">{f.dia}</td>
                                                        <td className="px-6 py-4">
                                                            {f.horaInicio.slice(0, 5)} - {f.horaFin.slice(0, 5)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide rounded border ${f.estado === 'DISPONIBLE'
                                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                                }`}>
                                                                {f.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {f.estado === 'DISPONIBLE' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => eliminar(f.id)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                    title="Eliminar franja"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
