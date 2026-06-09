import { useState, useEffect, Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Check, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react'
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

const formatHora = (hora: string): string => hora.substring(0, 5)

const formSchema = z.object({
    disponibilidadId: z.number().min(1, 'Selecciona una franja horaria'),
    fecha: z.string().min(1, 'Selecciona una fecha correcta').refine((val) => {
        const date = new Date(val + 'T00:00:00')
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        return date >= hoy
    }, 'La fecha debe ser futura')
})

type FormData = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onClose: () => void
    chat: ChatResponse
    onSesionCreada: (sesion: SesionResponse) => void
}

const PASOS = ['Horario', 'Fecha', 'Listo']

export function AgendarSesionDialog({ open, onClose, chat, onSesionCreada }: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [disponibilidades, setDisponibilidades] = useState<DisponibilidadResponse[]>([])
    const [cargandoDispo, setCargandoDispo] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [sesionCreada, setSesionCreada] = useState<SesionResponse | null>(null)

    const { crearSesion } = useSesiones()

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: 'onChange'
    })

    const selectedDispoId = watch('disponibilidadId')
    const selectedFecha = watch('fecha')
    const selectedDispo = disponibilidades.find(d => d.id === selectedDispoId)

    const dayMismatch = selectedFecha && selectedDispo
        ? new Date(selectedFecha + 'T00:00:00').getDay() !== DIA_A_NUMERO[selectedDispo.dia]
        : false

    useEffect(() => {
        if (open) {
            reset()
            setStep(1)
            setErrorMsg('')
            setSesionCreada(null)
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

    const handleContinuar = () => {
        if (!selectedDispoId) return
        setErrorMsg('')
        setStep(2)
    }

    const onSubmit = async (data: FormData) => {
        if (!selectedDispo) return

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

            setSesionCreada(sesion)
            onSesionCreada(sesion)
            setStep(3)
        } catch (error: any) {
            setErrorMsg(
                error.response?.data?.message ||
                (typeof error.response?.data === 'string'
                    ? error.response.data
                    : 'Error al crear la sesión. Intenta de nuevo.')
            )
            cargarDisponibilidades()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        onClose()
        reset()
    }

    return (
        <Dialog open={open} onOpenChange={(val: boolean) => !val && handleClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {step === 3 ? '¡Sesión Agendada!' : `Agendar Sesión con ${chat.nombreEstudiante}`}
                    </DialogTitle>
                    {step !== 3 && (
                        <DialogDescription>
                            {step === 1
                                ? 'Selecciona una franja de tu disponibilidad.'
                                : 'Confirma la fecha para la sesión.'}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Indicador de pasos */}
                {step !== 3 && (
                    <div className="flex items-center justify-center gap-1 py-2">
                        {PASOS.map((nombre, i) => {
                            const num = (i + 1) as 1 | 2 | 3
                            const done = step > num
                            const active = step === num
                            return (
                                <Fragment key={nombre}>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                            active
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : done
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                            {done ? <Check className="w-3.5 h-3.5" /> : num}
                                        </div>
                                        <span className={`text-[10px] font-semibold ${active ? 'text-primary' : 'text-slate-400'}`}>
                                            {nombre}
                                        </span>
                                    </div>
                                    {i < PASOS.length - 1 && (
                                        <div className={`h-0.5 w-10 mb-4 transition-all ${done ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                    )}
                                </Fragment>
                            )
                        })}
                    </div>
                )}

                {/* PASO 1 — Seleccionar franja */}
                {step === 1 && (
                    <div className="space-y-3 py-2">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Franjas disponibles</h4>

                        {cargandoDispo ? (
                            <div className="py-8 flex justify-center text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : disponibilidades.length === 0 ? (
                            <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 border border-dashed rounded-lg p-4 text-center">
                                No tienes franjas disponibles. Ve a <strong>Disponibilidad</strong> para agregar horarios.
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

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                            <Button type="button" onClick={handleContinuar} disabled={!selectedDispoId}>
                                Continuar →
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {/* PASO 2 — Confirmar fecha */}
                {step === 2 && selectedDispo && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <div className="space-y-3">
                            <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800">
                                Franja: <span className="font-semibold text-primary">{selectedDispo.dia} · {formatHora(selectedDispo.horaInicio)} – {formatHora(selectedDispo.horaFin)}</span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Fecha de la sesión
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        className="flex h-11 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100"
                                        {...register('fecha')}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value + 'T00:00:00')
                                            if (date.getDay() !== DIA_A_NUMERO[selectedDispo.dia]) {
                                                setErrorMsg(`La fecha debe caer un ${selectedDispo.dia}`)
                                            } else {
                                                setErrorMsg('')
                                            }
                                            setValue('fecha', e.target.value, { shouldValidate: true })
                                        }}
                                    />
                                </div>
                                {errors.fecha && (
                                    <p className="text-xs text-red-500">{errors.fecha.message}</p>
                                )}
                            </div>
                        </div>

                        {selectedFecha && !errors.fecha && !dayMismatch && (
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-100 dark:border-slate-800 space-y-1.5 text-sm">
                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resumen</h5>
                                <p className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                                    {formatDate(selectedFecha)}
                                </p>
                                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span className="w-4 text-center text-primary">🕐</span>
                                    {formatHora(selectedDispo.horaInicio)} – {formatHora(selectedDispo.horaFin)}
                                </p>
                                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span className="w-4 text-center text-primary">👤</span>
                                    {chat.nombreEstudiante}
                                </p>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {errorMsg}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => { setStep(1); setErrorMsg('') }}>
                                ← Atrás
                            </Button>
                            <Button
                                type="submit"
                                disabled={!selectedFecha || !!errors.fecha || isSubmitting || dayMismatch}
                            >
                                {isSubmitting
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Agendando...</>
                                    : 'Agendar Sesión'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {/* PASO 3 — Confirmación exitosa */}
                {step === 3 && sesionCreada && (
                    <div className="py-4 space-y-4">
                        <div className="flex flex-col items-center gap-3 py-2">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm text-center">
                                La sesión fue agendada exitosamente y queda en estado <strong>Pendiente</strong> de aprobación.
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-100 dark:border-slate-800 space-y-1.5 text-sm">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detalles</h5>
                            <p className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                                {formatDate(sesionCreada.fecha)}
                            </p>
                            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="w-4 text-center text-primary">🕐</span>
                                {sesionCreada.horaInicio.slice(0, 5)} – {sesionCreada.horaFin.slice(0, 5)}
                            </p>
                            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="w-4 text-center text-primary">👤</span>
                                {sesionCreada.nombreEstudiante}
                            </p>
                            <div className="pt-1">
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                    {sesionCreada.estado}
                                </span>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">Cerrar</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
