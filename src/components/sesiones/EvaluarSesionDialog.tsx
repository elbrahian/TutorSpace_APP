import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Star, Send, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Avatar } from '../shared/Avatar'
import { calificacionApi } from '../../api/calificacionApi'
import type { CalificacionSesionResponse, SesionResponse } from '../../types'
import { formatDate } from '../../utils/formatDate'

const ETIQUETAS_CALIFICACION: Record<number, string> = {
    1: 'Malo',
    2: 'Regular',
    3: 'Bueno',
    4: 'Muy bueno',
    5: 'Excelente',
}

const calcularDuracion = (horaInicio: string, horaFin: string): string => {
    const [hi, mi] = horaInicio.split(':').map(Number)
    const [hf, mf] = horaFin.split(':').map(Number)
    const minutos = (hf * 60 + mf) - (hi * 60 + mi)
    return minutos > 0 ? `${minutos} min` : ''
}

const formSchema = z.object({
    calificacion: z.number().min(1, 'Selecciona una calificación').max(5),
    comentario: z.string().max(500, 'El comentario no puede superar 500 caracteres').optional(),
})

type FormData = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onClose: () => void
    sesion: SesionResponse
    onEvaluada?: (resultado: CalificacionSesionResponse) => void
}

export function EvaluarSesionDialog({ open, onClose, sesion, onEvaluada }: Props) {
    const [hoverValue, setHoverValue] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [exito, setExito] = useState<CalificacionSesionResponse | null>(null)

    const { handleSubmit, setValue, watch, reset, register, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: { calificacion: 0, comentario: '' },
    })

    const calificacion = watch('calificacion')
    const comentario = watch('comentario') ?? ''
    const valorVisible = hoverValue || calificacion

    useEffect(() => {
        if (open) {
            reset({ calificacion: 0, comentario: '' })
            setHoverValue(0)
            setErrorMsg('')
            setExito(null)
        }
    }, [open, reset])

    const onSubmit = async (data: FormData) => {
        try {
            setIsSubmitting(true)
            setErrorMsg('')
            const resultado = await calificacionApi.evaluarSesion(sesion.id, {
                calificacion: data.calificacion,
                comentario: data.comentario?.trim() ? data.comentario.trim() : undefined,
            })
            setExito(resultado)
            onEvaluada?.(resultado)
        } catch (error: any) {
            const status = error.response?.status
            if (status === 409) {
                setErrorMsg(error.response?.data?.message || 'Esta sesión ya fue evaluada.')
            } else if (status === 403) {
                setErrorMsg('No puedes evaluar una sesión que no es tuya.')
            } else {
                setErrorMsg(
                    error.response?.data?.message ||
                    (typeof error.response?.data === 'string'
                        ? error.response.data
                        : 'Error al enviar la evaluación')
                )
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val: boolean) => !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                {exito ? (
                    <div className="flex flex-col items-center text-center py-6 gap-3">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">¡Gracias por tu feedback!</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{exito.mensaje}</p>
                        <Button className="mt-2" onClick={onClose}>Listo</Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <DialogTitle>¿Cómo fue tu tutoría?</DialogTitle>
                            <DialogDescription>
                                Tu opinión ayuda a mejorar la experiencia de la comunidad.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
                            {/* Resumen de la sesión */}
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                                <Avatar nombre={sesion.nombreTutor} rol="TUTOR" size="md" />
                                <div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{sesion.nombreTutor}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {[calcularDuracion(sesion.horaInicio, sesion.horaFin), formatDate(sesion.fecha)]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                </div>
                            </div>

                            {/* Calificación con estrellas */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tu calificación</p>
                                <div className="flex gap-3">
                                    {[1, 2, 3, 4, 5].map((n) => {
                                        const activa = n <= valorVisible
                                        return (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setValue('calificacion', n, { shouldValidate: true })}
                                                onMouseEnter={() => setHoverValue(n)}
                                                onMouseLeave={() => setHoverValue(0)}
                                                aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                                                className={`flex-1 aspect-square max-w-[64px] rounded-lg border flex items-center justify-center transition-colors ${
                                                    activa
                                                        ? 'border-amber-400/40 bg-amber-400/10'
                                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-400/40'
                                                }`}
                                            >
                                                <Star className={`w-6 h-6 ${activa ? 'fill-amber-400 text-amber-400' : 'text-slate-400 dark:text-slate-600'}`} />
                                            </button>
                                        )
                                    })}
                                </div>
                                {valorVisible > 0 && (
                                    <p className="text-sm font-semibold text-primary">
                                        {ETIQUETAS_CALIFICACION[valorVisible]} ({valorVisible}/5)
                                    </p>
                                )}
                                {errors.calificacion && (
                                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.calificacion.message}</p>
                                )}
                            </div>

                            {/* Comentario */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Comentario</label>
                                <textarea
                                    {...register('comentario')}
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Cuéntanos cómo te fue en la tutoría (opcional)"
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 resize-none"
                                />
                                <div className="flex justify-between">
                                    {errors.comentario ? (
                                        <p className="text-xs text-red-500">{errors.comentario.message}</p>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="text-xs text-slate-400">{comentario.length}/500</span>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                    {errorMsg}
                                </div>
                            )}

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                                    ) : (
                                        <><Send className="w-4 h-4 mr-2" /> Enviar feedback</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
