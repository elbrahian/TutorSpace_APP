import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { estudianteApi } from '../../api/estudianteApi'
import { chatApi } from '../../api/chatApi'
import { useChatStore } from '../../store/chatStore'
import type { MateriaResponse, TutorBusquedaResponse } from '../../types'
import { Search, MessageSquare, Clock } from 'lucide-react'

export default function BuscarTutores() {
    const [materias, setMaterias] = useState<MateriaResponse[]>([])
    const [materiaId, setMateriaId] = useState<number | ''>('')
    const [tutores, setTutores] = useState<TutorBusquedaResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [chatLoadingId, setChatLoadingId] = useState<number | null>(null)

    const navigate = useNavigate()
    const setChatActivo = useChatStore(state => state.setChatActivo)

    useEffect(() => {
        estudianteApi.getMaterias().then(data => setMaterias(data))
        // Quitamos la búsqueda inicial automática para evitar el error 403 con materiaId vacío
    }, [])

    const buscar = async (mId = materiaId) => {
        // Validación: No permitir búsqueda si no hay materia seleccionada
        if (!mId || mId === '') {
            setTutores([])
            return
        }

        try {
            setLoading(true)
            const resp = await estudianteApi.buscarTutores(mId)
            setTutores(resp.content)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleMateriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : ''
        setMateriaId(val)
        // Ya no buscamos automáticamente al cambiar, esperamos al botón
    }

    const iniciarChat = async (tutor: TutorBusquedaResponse) => {
        try {
            setChatLoadingId(tutor.id)
            const chat = await chatApi.iniciarChat(tutor.id)
            setChatActivo(chat)
            navigate('/estudiante/chat')
        } catch (e) {
            console.error("Error iniciando chat", e)
            // Si falla porque el chat ya existe u otro error, buscamos el existente y redirigimos
            try {
                const misChats = await chatApi.getMisChats()
                const chatExistente = misChats.find(c => c.tutorId === tutor.id)
                if (chatExistente) {
                    setChatActivo(chatExistente)
                    navigate('/estudiante/chat')
                }
            } catch (innerError) {
                console.error("Error buscando chat existente", innerError)
            }
        } finally {
            setChatLoadingId(null)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Buscar Tutores</h1>
                    <p className="text-slate-500 mt-2">Filtra por materia y contacta al tutor que mejor se ajuste a tu horario.</p>
                </div>

                <Card className="border-0 shadow-md bg-white dark:bg-slate-900 pt-6">
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                                    value={materiaId}
                                    onChange={handleMateriaChange}
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Selecciona una materia...</option>
                                    {materias.map(m => (
                                        <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                            {m.nombre} ({m.codigo})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button 
                                onClick={() => buscar()} 
                                disabled={!materiaId || loading}
                                className="sm:w-32"
                            >
                                {loading ? 'Buscando...' : 'Buscar'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8">
                    {loading ? (
                        <div className="flex justify-center py-12 text-slate-500">Buscando tutores...</div>
                    ) : !materiaId ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 border border-dashed rounded-xl">
                            Por favor selecciona una materia para ver los tutores disponibles.
                        </div>
                    ) : tutores.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 border border-dashed rounded-xl">
                            No se encontraron tutores disponibles para tu búsqueda.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tutores.map(t => (
                                <Card key={t.id} className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800">
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                                                {t.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{t.nombre}</h3>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {t.jornadaGeneral}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Materias</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {t.materias.map(m => (
                                                    <span key={m.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                                        {m.nombre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Días Disponibles</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {t.diasDisponibles.map(dia => (
                                                    <span key={dia} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {dia}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            onClick={() => iniciarChat(t)}
                                            disabled={chatLoadingId === t.id}
                                        >
                                            {chatLoadingId === t.id ? 'Iniciando...' : (
                                                <>
                                                    <MessageSquare className="w-4 h-4 mr-2" /> Iniciar Chat
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
