import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { AgendarSesionDialog } from '../../components/sesiones/AgendarSesionDialog'
import { Avatar } from '../../components/shared/Avatar'
import { Button } from '../../components/ui/button'
import { chatApi } from '../../api/chatApi'
import { CalendarPlus, MessageSquare } from 'lucide-react'
import type { ChatResponse } from '../../types'

export default function AgendarSesionPage() {
    const [chats, setChats] = useState<ChatResponse[]>([])
    const [cargando, setCargando] = useState(true)
    const [chatSeleccionado, setChatSeleccionado] = useState<ChatResponse | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        chatApi.getMisChats()
            .then(data => setChats(data))
            .catch(console.error)
            .finally(() => setCargando(false))
    }, [])

    const handleAgendar = (chat: ChatResponse) => {
        setChatSeleccionado(chat)
        setDialogOpen(true)
    }

    const handleClose = () => {
        setDialogOpen(false)
        setChatSeleccionado(null)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Agendar Sesión</h1>
                    <p className="text-slate-500 mt-2">
                        Selecciona un estudiante con quien hayas conversado para agendar una sesión de tutoría.
                    </p>
                </div>

                {cargando ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : chats.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 border border-dashed rounded-xl space-y-3">
                        <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">No tienes conversaciones activas</p>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Los estudiantes deben iniciar un chat contigo primero. Una vez que lo hagan, aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chats.map(chat => (
                            <div
                                key={chat.id}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                            >
                                <Avatar nombre={chat.nombreEstudiante} rol="ESTUDIANTE" size="lg" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                                        {chat.nombreEstudiante}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">Conversación activa</p>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-11 shrink-0"
                                    onClick={() => handleAgendar(chat)}
                                    aria-label={`Agendar sesión con ${chat.nombreEstudiante}`}
                                >
                                    <CalendarPlus className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Agendar</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {chatSeleccionado && (
                <AgendarSesionDialog
                    open={dialogOpen}
                    onClose={handleClose}
                    chat={chatSeleccionado}
                    onSesionCreada={() => {}}
                />
            )}
        </DashboardLayout>
    )
}
