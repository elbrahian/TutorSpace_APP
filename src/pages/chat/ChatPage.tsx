import { useState, useEffect } from 'react'
import { MessageSquare, CalendarPlus, ChevronLeft } from 'lucide-react'
import { Navbar } from '../../components/layout/Navbar'
import { ChatSidebar } from '../../components/chat/ChatSidebar'
import { ChatMessages } from '../../components/chat/ChatMessages'
import { ChatInput } from '../../components/chat/ChatInput'
import { AgendarSesionDialog } from '../../components/sesiones/AgendarSesionDialog'
import { Avatar } from '../../components/shared/Avatar'
import { Button } from '../../components/ui/button'
import { useChat } from '../../hooks/useChat'
import { useAuthStore } from '../../store/authStore'
import type { Rol } from '../../types'

export default function ChatPage() {
    const { usuario } = useAuthStore()
    const {
        chats, chatActivo, mensajes, cargando, cargarChats,
        setChatActivo, getNombreChat, enviarMensaje
    } = useChat()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [mobileView, setMobileView] = useState<'lista' | 'chat'>('lista')

    useEffect(() => {
        cargarChats()
    }, [])

    // Sincronizar vista móvil cuando cambia el chat activo
    useEffect(() => {
        if (chatActivo) {
            setMobileView('chat')
        } else {
            setMobileView('lista')
        }
    }, [chatActivo])

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)] relative">
                {/* Izquierda: Sidebar de chats */}
                <div className={`
                    ${mobileView === 'lista' ? 'flex' : 'hidden'} 
                    lg:flex w-full lg:w-80 flex-col shrink-0 border-r border-slate-200 dark:border-slate-800
                `}>
                    <ChatSidebar 
                        chats={chats} 
                        chatActivo={chatActivo}
                        onSeleccionar={(chat) => {
                            setChatActivo(chat)
                            setMobileView('chat')
                        }}
                        getNombreChat={getNombreChat}
                    />
                </div>
                
                {/* Derecha: Área de mensajes */}
                <div className={`
                    ${mobileView === 'chat' ? 'flex' : 'hidden'} 
                    lg:flex flex-1 flex-col min-w-0 bg-white dark:bg-slate-900 relative z-10
                `}>
                    {chatActivo ? (
                        <>
                            {/* Cabecera del chat activo */}
                            <div className="h-16 md:h-20 border-b flex items-center px-4 md:px-6 bg-white dark:bg-slate-950 shrink-0 z-10 shadow-sm relative">
                                <div className="flex items-center gap-3 md:gap-4 w-full">
                                    {/* Botón Volver (Solo Móvil) */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden -ml-2 h-11 w-11"
                                        onClick={() => setMobileView('lista')}
                                        aria-label="Volver a la lista de chats"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </Button>

                                    <Avatar 
                                        nombre={getNombreChat(chatActivo)} 
                                        rol={usuario?.rol === 'TUTOR' ? 'ESTUDIANTE' as Rol : 'TUTOR' as Rol}
                                        size="md"
                                        className="w-10 h-10 md:w-12 md:h-12"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base md:text-lg leading-tight tracking-tight truncate">
                                            {getNombreChat(chatActivo)}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                                            <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest">En línea</span>
                                        </div>
                                    </div>
                                    
                                    {usuario?.rol === 'TUTOR' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="ml-auto bg-primary/5 text-primary hover:bg-primary/10 border-primary/20 h-11 px-3"
                                            onClick={() => setDialogOpen(true)}
                                            aria-label="Agendar sesión"
                                        >
                                            <CalendarPlus className="w-4 h-4 md:mr-2" />
                                            <span className="hidden md:inline">Agendar Sesión</span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Mensajes */}
                            <ChatMessages 
                                mensajes={mensajes} 
                                usuarioId={usuario?.id}
                                cargando={cargando}
                            />

                            {/* Input */}
                            <ChatInput onEnviar={enviarMensaje} />

                            {/* Modal Agendar Sesion (Tutor) */}
                            {usuario?.rol === 'TUTOR' && (
                                <AgendarSesionDialog 
                                    open={dialogOpen}
                                    onClose={() => setDialogOpen(false)}
                                    chat={chatActivo}
                                    onSesionCreada={() => {
                                        // La sesión se auto-agrega mediante useSesiones() al Zustand
                                        // Notification o feedback opcional.
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-950/50">
                            <div className="w-24 h-24 mb-6 rounded-3xl rotate-3 bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                                <MessageSquare className="w-10 h-10 text-slate-400 dark:text-slate-500 -rotate-3" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-200 mb-3">
                                Selecciona una conversación
                            </h2>
                            {usuario?.rol === 'ESTUDIANTE' ? (
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                                    Elige un chat de la lista izquierda o ve a la sección de "Buscar Tutores" para iniciar una nueva conversación.
                                </p>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                                    Elige un chat de la lista izquierda para responder a las consultas o requerimientos de los estudiantes y brindarles una asesoría integral.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
