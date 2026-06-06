import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { sesionApi } from '../../api/sesionApi'
import type { SesionResponse } from '../../types'
import { Calendar, Clock, Star, UserRound } from 'lucide-react'

export default function EvaluacionesTutor() {
    const [sesiones, setSesiones] = useState<SesionResponse[]>([])
    const [selectedSesion, setSelectedSesion] = useState<SesionResponse | null>(null)
    const [puntuacion, setPuntuacion] = useState(5)
    const [observaciones, setObservaciones] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        cargarSesiones()
    }, [])

    const cargarSesiones = async () => {
        try {
            const data = await sesionApi.getSesionesTutor()
            setSesiones(data)
        } catch (error) {
            console.error(error)
            setFeedback({
                type: 'error',
                text: 'No fue posible cargar tus sesiones para evaluar.'
            })
        }
    }

    const sesionesCompletadas = useMemo(
        () => sesiones.filter((sesion) => sesion.estado === 'COMPLETADA'),
        [sesiones]
    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!selectedSesion) return

        if (puntuacion < 1 || puntuacion > 5) {
            setFeedback({ type: 'error', text: 'La puntuación debe estar entre 1 y 5.' })
            return
        }

        if (observaciones.trim().length > 500) {
            setFeedback({ type: 'error', text: 'Las observaciones no pueden superar 500 caracteres.' })
            return
        }

        try {
            setSubmitting(true)
            setFeedback(null)

            await sesionApi.evaluarEstudiante(selectedSesion.id, {
                puntuacion,
                observaciones: observaciones.trim() || undefined,
            })

            setFeedback({
                type: 'success',
                text: `La evaluación para ${selectedSesion.nombreEstudiante} fue registrada correctamente.`
            })
            setSelectedSesion(null)
            setObservaciones('')
            setPuntuacion(5)
            await cargarSesiones()
        } catch (error: any) {
            console.error(error)
            setFeedback({
                type: 'error',
                text: error.response?.data?.message || 'No se pudo registrar la evaluación. Intenta nuevamente.'
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Evaluaciones del estudiante</h1>
                    <p className="text-slate-500 text-sm md:text-base">Registra la retroalimentación académica de cada sesión completada.</p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-100">
                    Solo aparecen aquí las sesiones con estado completado para que puedas asignar una evaluación de 1 a 5 y dejar observaciones opcionales.
                </div>

                {feedback && (
                    <div className={`rounded-xl border p-4 text-sm ${feedback.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-100'
                        : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-100'}`}>
                        {feedback.text}
                    </div>
                )}

                {sesionesCompletadas.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-slate-500">No tienes sesiones completadas para evaluar en este momento.</CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {sesionesCompletadas.map((sesion) => (
                            <Card key={sesion.id} className="border-slate-200 dark:border-slate-800 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl">{sesion.nombreEstudiante}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-2"><UserRound className="w-4 h-4 text-primary" /> Estudiante: {sesion.nombreEstudiante}</div>
                                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {sesion.fecha}</div>
                                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {sesion.horaInicio.slice(0, 5)} - {sesion.horaFin.slice(0, 5)}</div>
                                    </div>

                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <span className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            {sesion.estado}
                                        </span>
                                        <Button onClick={() => {
                                            setSelectedSesion(sesion)
                                            setFeedback(null)
                                        }}>
                                            Evaluar estudiante
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {selectedSesion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Nueva evaluación</p>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSesion.nombreEstudiante}</h2>
                                    <p className="text-sm text-slate-500">Sesión del {selectedSesion.fecha} · {selectedSesion.horaInicio.slice(0, 5)} - {selectedSesion.horaFin.slice(0, 5)}</p>
                                </div>
                                <Button variant="ghost" onClick={() => setSelectedSesion(null)} disabled={submitting}>Cerrar</Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Puntuación</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setPuntuacion(value)}
                                                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${puntuacion === value
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/40 hover:bg-primary/5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'}`}
                                            >
                                                <Star className="w-4 h-4" /> {value}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">Selecciona una puntuación de 1 a 5.</p>
                                </div>

                                <div>
                                    <label htmlFor="observaciones" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Observaciones (opcional)</label>
                                    <textarea
                                        id="observaciones"
                                        rows={5}
                                        maxLength={500}
                                        value={observaciones}
                                        onChange={(event) => setObservaciones(event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                                        placeholder="Describe el desempeño, la participación o el compromiso del estudiante."
                                    />
                                    <p className="mt-1 text-xs text-slate-500">Máximo 500 caracteres.</p>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:justify-end dark:border-slate-800">
                                    <Button type="button" variant="outline" onClick={() => setSelectedSesion(null)} disabled={submitting}>Cancelar</Button>
                                    <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Enviar evaluación'}</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
