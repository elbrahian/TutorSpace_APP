import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Check, Calendar as CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { sesionApi } from '../../api/sesionApi'
import { useSesiones } from '../../hooks/useSesiones'
import type { ChatResponse, DisponibilidadResponse, SesionResponse } from '../../types'
import { formatDate } from '../../utils/formatDate'

const DIA_A_NUMERO: Record<string, number> = {
  'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3,
  'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6
}

const proximaFecha = (dia: string): string => {
  const hoy = new Date()
  const diaObjetivo = DIA_A_NUMERO[dia]
  const diff = (diaObjetivo - hoy.getDay() + 7) % 7 || 7
  const fecha = new Date(hoy)
  fecha.setDate(hoy.getDate() + diff)
  return fecha.toISOString().split('T')[0]
}

const formatHora = (hora: string): string => {
  return hora.substring(0, 5)
}

const formSchema = z.object({
    disponibilidadId: z.number().min(1, "Selecciona una franja horaria"),
    fecha: z.string().min(1, "Selecciona una fecha correcta").refine((val) => {
        const date = new Date(val + 'T00:00:00')
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        return date >= hoy
    }, "La fecha debe ser futura")
})

type FormData = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onClose: () => void
    chat: ChatResponse
    onSesionCreada: (sesion: SesionResponse) => void
}

export function AgendarSesionDialog({ open, onClose, chat, onSesionCreada }: Props) {
    const [disponibilidades, setDisponibilidades] = useState<DisponibilidadResponse[]>([])
    const [cargandoDispo, setCargandoDispo] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    
    const { crearSesion } = useSesiones()

    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isValid } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: 'onChange'
    })

    const selectedDispoId = watch('disponibilidadId')
    const selectedFecha = watch('fecha')
    
    const selectedDispo = disponibilidades.find(d => d.id === selectedDispoId)

    useEffect(() => {
        if (open) {
            reset()
            setErrorMsg('')
            cargarDisponibilidades()
        }
    }, [open, reset])

    const cargarDisponibilidades = async () => {
        try {
            setCargandoDispo(true)
            const data = await sesionApi.getDisponibilidadTutor()
            setDisponibilidades(data.filter(d => d.estado === 'DISPONIBLE'))
        } catch (error) {
            console.error(error)
        } finally {
            setCargandoDispo(false)
        }
    }

    const handleSelectDispo = (d: DisponibilidadResponse) => {
        setValue('disponibilidadId', d.id, { shouldValidate: true })
        setValue('fecha', proximaFecha(d.dia), { shouldValidate: true })
    }

    const onSubmit = async (data: FormData) => {
        if (!selectedDispo) return
        
        // Custom check to ensure date matches the day logic
        const date = new Date(data.fecha + 'T00:00:00')
        if (date.getDay() !== DIA_A_NUMERO[selectedDispo.dia]) {
            setErrorMsg(`La fecha seleccionada no es un ${selectedDispo.dia}`)
            return
        }
        
        try {
            setIsSubmitting(true)
            setErrorMsg('')
            
            const sesion = await crearSesion({
                estudianteId: chat.estudianteId,
                disponibilidadId: data.disponibilidadId,
                fecha: data.fecha,
                horaInicio: selectedDispo.horaInicio,
                horaFin: selectedDispo.horaFin
            })
            
            onSesionCreada(sesion)
            onClose()
            reset()
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || typeof error.response?.data === 'string' ? error.response.data : 'Error al crear la sesión')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val: boolean) => !val && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Agendar Sesión con {chat.nombreEstudiante}</DialogTitle>
                    <DialogDescription>
                        Selecciona una franja disponible y la fecha para reservar la asesoría.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* PASO 1: FRANJAS */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">1. Selecciona un horario disponible</h4>
                        
                        {cargandoDispo ? (
                            <div className="py-8 flex justify-center text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : disponibilidades.length === 0 ? (
                            <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 border border-dashed rounded-lg p-4 text-center">
                                No tienes franjas disponibles. Ve a "Disponibilidad" para agregar horarios.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                                {disponibilidades.map(d => {
                                    const isSelected = selectedDispoId === d.id
                                    return (
                                        <div 
                                            key={d.id}
                                            onClick={() => handleSelectDispo(d)}
                                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all relative ${
                                                isSelected 
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                                : 'border-slate-200 hover:border-primary/50 dark:border-slate-800 dark:hover:border-primary/40'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                            <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{d.dia}</p>
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                                                {formatHora(d.horaInicio)} - {formatHora(d.horaFin)}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {errors.disponibilidadId && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.disponibilidadId.message}</p>}
                    </div>

                    {/* PASO 2: FECHA */}
                    {selectedDispo && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">2. Confirma la fecha</h4>
                            <div className="flex flex-col gap-2">
                                <input 
                                    type="date" 
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    {...register('fecha')}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value + 'T00:00:00')
                                        if (date.getDay() !== DIA_A_NUMERO[selectedDispo.dia]) {
                                            setErrorMsg(`Atención: La fecha debe caer un ${selectedDispo.dia}`)
                                        } else {
                                            setErrorMsg('')
                                        }
                                        setValue('fecha', e.target.value, { shouldValidate: true })
                                    }}
                                />
                            </div>
                            {errors.fecha && <p className="text-xs text-red-500">{errors.fecha.message}</p>}
                            
                            {selectedFecha && !errors.fecha && (
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mt-4 border border-slate-100 dark:border-slate-800">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resumen de la Sesión</h5>
                                    <div className="space-y-1.5 text-sm">
                                        <p className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-primary" /> {formatDate(selectedFecha)}</p>
                                        <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <span className="w-4 inline-block text-center text-primary">🕐</span> 
                                            {formatHora(selectedDispo.horaInicio)} - {formatHora(selectedDispo.horaFin)}
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <span className="w-4 inline-block text-center text-primary">👤</span> 
                                            {chat.nombreEstudiante}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {errorMsg && (
                        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Agendando...</>
                            ) : (
                                "Agendar Sesión"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
