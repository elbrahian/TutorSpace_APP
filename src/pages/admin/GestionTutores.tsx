import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { tutorApi } from '../../api/tutorApi'
import type { TutorResponse, MateriaResponse } from '../../types'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { CheckCircle2, XCircle, Plus, BookOpen, Clock, UserX, UserCheck, Loader2 } from 'lucide-react'

const tutorSchema = z.object({
    nombre: z.string().min(2, 'Obligatorio'),
    email: z.string().email().refine(val => val.endsWith('@uco.net.co'), 'Debe ser @uco.net.co'),
    password: z.string().min(6, 'Min 6 chars'),
    jornadaGeneral: z.string().min(3, 'Obligatorio'),
})

type TutorForm = z.infer<typeof tutorSchema>

export default function GestionTutores() {
    const [tutores, setTutores] = useState<TutorResponse[]>([])
    const [materiasDb, setMateriasDb] = useState<MateriaResponse[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [selectedTutor, setSelectedTutor] = useState<TutorResponse | null>(null)

    const [tutorToToggle, setTutorToToggle] = useState<TutorResponse | null>(null)
    const [isToggling, setIsToggling] = useState(false)
    const [toggleError, setToggleError] = useState('')

    const [tutorToEditJornada, setTutorToEditJornada] = useState<TutorResponse | null>(null)
    const [isEditingJornada, setIsEditingJornada] = useState(false)
    const [jornadaInput, setJornadaInput] = useState('')
    const [jornadaError, setJornadaError] = useState('')

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TutorForm>({
        resolver: zodResolver(tutorSchema)
    })

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [tData, mData] = await Promise.all([
                tutorApi.getTutores(),
                tutorApi.getMaterias()
            ])
            setTutores(tData)
            setMateriasDb(mData)
        } catch (e) {
            console.error(e)
        }
    }

    const onSubmitTutor = async (data: TutorForm) => {
        try {
            await tutorApi.createTutor(data)
            setIsCreating(false)
            reset()
            cargarDatos()
        } catch (e) {
            console.error(e)
        }
    }

    const handleToggleEstado = async () => {
        if (!tutorToToggle) return
        try {
            setIsToggling(true)
            setToggleError('')
            let updatedTutor: TutorResponse

            if (tutorToToggle.estado === 'ACTIVO') {
                updatedTutor = await tutorApi.desactivarTutor(tutorToToggle.id)
            } else {
                updatedTutor = await tutorApi.activarTutor(tutorToToggle.id)
            }
            
            setTutores(prev => prev.map(t => t.id === tutorToToggle.id ? updatedTutor : t))
            setTutorToToggle(null)
        } catch (error: any) {
            setToggleError(error.response?.data?.message || 'Error al cambiar estado')
        } finally {
            setIsToggling(false)
        }
    }

    const handleEditJornada = async () => {
        if (!tutorToEditJornada) return
        try {
            setIsEditingJornada(true)
            setJornadaError('')
            const updatedTutor = await tutorApi.editarJornada(tutorToEditJornada.id, jornadaInput)
            setTutores(prev => prev.map(t => t.id === tutorToEditJornada.id ? updatedTutor : t))
            setTutorToEditJornada(null)
        } catch (error: any) {
            setJornadaError(error.response?.data?.message || 'Error al cambiar jornada')
        } finally {
            setIsEditingJornada(false)
        }
    }

    const asignarMateria = async (tutorId: number, materiaId: number) => {
        try {
            await tutorApi.asignarMateria(tutorId, materiaId)
            cargarDatos()
            // actualizar localmente selectedTutor
            const t = tutores.find(x => x.id === tutorId)
            if (t) {
                const m = materiasDb.find(x => x.id === materiaId)
                if (m) setSelectedTutor({ ...t, materias: [...t.materias, m] })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const quitarMateria = async (tutorId: number, materiaId: number) => {
        try {
            await tutorApi.quitarMateria(tutorId, materiaId)
            cargarDatos()
            // actualizar localmente selectedTutor
            if (selectedTutor) {
                setSelectedTutor({
                    ...selectedTutor,
                    materias: selectedTutor.materias.filter(x => x.id !== materiaId)
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestión de Tutores</h1>
                        <p className="text-slate-500 mt-2">Crea cuentas de tutor y asigna sus materias correspondientes.</p>
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Crear Tutor
                    </Button>
                </div>

                {/* Tabla principal */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b">
                                <tr>
                                    <th className="px-6 py-4">Nombre / Email</th>
                                    <th className="px-6 py-4">Jornada</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Materias</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tutores.map(t => (
                                    <tr key={t.id} className="border-b dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{t.nombre}</div>
                                            <div className="text-slate-500">{t.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{t.jornadaGeneral}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${t.estado === 'ACTIVO'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                            >
                                                {t.estado === 'ACTIVO' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {t.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {t.materias.map(m => (
                                                    <span key={m.id} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                                                        {m.codigo}
                                                    </span>
                                                ))}
                                                {t.materias.length === 0 && <span className="text-xs text-slate-400 italic">Sin materias</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col gap-2 w-40 ml-auto">
                                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-700 dark:text-slate-300" onClick={() => { setTutorToEditJornada(t); setJornadaInput(t.jornadaGeneral || 'MAÑANA'); setJornadaError(''); }}>
                                                    <Clock className="w-4 h-4 mr-2 text-blue-500" /> Editar jornada
                                                </Button>
                                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-700 dark:text-slate-300" onClick={() => setSelectedTutor(t)}>
                                                    <BookOpen className="w-4 h-4 mr-2 text-blue-500" /> Editar materias
                                                </Button>
                                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-700 dark:text-slate-300" onClick={() => { setTutorToToggle(t); setToggleError(''); }}>
                                                    {t.estado === 'ACTIVO' ? (
                                                        <><UserX className="w-4 h-4 mr-2 text-red-500" /> Desactivar</>
                                                    ) : (
                                                        <><UserCheck className="w-4 h-4 mr-2 text-green-500" /> Activar</>
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tutores.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay tutores registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Crear Tutor */}
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold mb-4">Registrar Nuevo Tutor</h3>
                            <form onSubmit={handleSubmit(onSubmitTutor)} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Nombre Completo</label>
                                    <Input {...register('nombre')} className={errors.nombre ? 'border-red-500' : ''} />
                                    {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email (@uco.net.co)</label>
                                    <Input type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Contraseña</label>
                                    <Input type="password" {...register('password')} className={errors.password ? 'border-red-500' : ''} />
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Jornada General (Ej: Diurna 8am-4pm)</label>
                                    <Input {...register('jornadaGeneral')} className={errors.jornadaGeneral ? 'border-red-500' : ''} />
                                    {errors.jornadaGeneral && <p className="text-xs text-red-500 mt-1">{errors.jornadaGeneral.message}</p>}
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                                    <Button type="submit">Guardar Tutor</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Materias Tutor */}
                {selectedTutor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-lg w-full p-6">
                            <h3 className="text-xl font-bold mb-2">Materias de: {selectedTutor.nombre}</h3>
                            <p className="text-sm text-slate-500 mb-6">Añade o remueve asignaturas que este tutor puede dictar.</p>

                            <div className="mb-6">
                                <h4 className="text-sm font-semibold mb-2">Materias Asignadas:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTutor.materias.map(m => (
                                        <span key={m.id} className="inline-flex items-center px-3 py-1 rounded bg-primary/10 text-primary text-sm font-medium gap-2">
                                            {m.nombre}
                                            <button onClick={() => quitarMateria(selectedTutor.id, m.id)} className="hover:text-red-500">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                    {selectedTutor.materias.length === 0 && <span className="text-sm text-slate-500 italic">Ninguna materia asignada</span>}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold mb-2">Añadir Materia:</h4>
                                <div className="flex gap-2">
                                    <select
                                        id="materiaSelect"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Seleccione una materia...</option>
                                        {materiasDb
                                            .filter(m => !selectedTutor.materias.some(assigned => assigned.id === m.id))
                                            .map(m => (
                                                <option key={m.id} value={m.id}>{m.nombre} ({m.codigo})</option>
                                            ))}
                                    </select>
                                    <Button onClick={() => {
                                        const sel = document.getElementById('materiaSelect') as HTMLSelectElement;
                                        if (sel.value) asignarMateria(selectedTutor.id, Number(sel.value));
                                    }}>
                                        Asignar
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 mt-6 border-t dark:border-slate-800">
                                <Button onClick={() => setSelectedTutor(null)}>Cerrar</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Confirmar Toggle Estado */}
                {tutorToToggle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
                            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Confirmar acción</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                                ¿Estás seguro que deseas <strong>{tutorToToggle.estado === 'ACTIVO' ? 'desactivar' : 'activar'}</strong> a {tutorToToggle.nombre}?
                            </p>
                            
                            {toggleError && <p className="text-xs text-red-500 mb-4">{toggleError}</p>}
                            
                            <div className="flex justify-center gap-3">
                                <Button variant="outline" onClick={() => setTutorToToggle(null)} disabled={isToggling}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleToggleEstado} disabled={isToggling} variant={tutorToToggle.estado === 'ACTIVO' ? 'destructive' : 'default'}>
                                    {isToggling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando</> : 'Confirmar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Editar Jornada */}
                {tutorToEditJornada && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-sm w-full p-6">
                            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Editar Jornada de {tutorToEditJornada.nombre}</h3>
                            
                            <div className="mb-6">
                                <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">Jornada General</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={jornadaInput}
                                    onChange={(e) => setJornadaInput(e.target.value)}
                                >
                                    <option value="MAÑANA" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">MAÑANA</option>
                                    <option value="TARDE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">TARDE</option>
                                    <option value="NOCHE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">NOCHE</option>
                                    <option value="COMPLETA" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">COMPLETA</option>
                                </select>
                            </div>

                            {jornadaError && <p className="text-xs text-red-500 mb-4">{jornadaError}</p>}

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setTutorToEditJornada(null)} disabled={isEditingJornada}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleEditJornada} disabled={isEditingJornada}>
                                    {isEditingJornada ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando</> : 'Guardar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    )
}
