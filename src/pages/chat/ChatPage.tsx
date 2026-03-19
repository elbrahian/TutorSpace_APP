import { useState, useEffect } from 'react'
import { MessageSquare, CalendarPlus } from 'lucide-react'
import { Navbar } from '../../components/layout/Navbar'
import { ChatSidebar } from '../../components/chat/ChatSidebar'
import { ChatMessages } from '../../components/chat/ChatMessages'
import { ChatInput } from '../../components/chat/ChatInput'
import { AgendarSesionDialog } from '../../components/sesiones/AgendarSesionDialog'
import { Button } from '../../components/ui/button'
import { useChat } from '../../hooks/useChat'
import { useAuthStore } from '../../store/authStore'

export default function ChatPage() {
    const { usuario } = useAuthStore()
    const {
        chats, chatActivo, mensajes, cargando, cargarChats,
        setChatActivo, getNombreChat, enviarMensaje
    } = useChat()

    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        cargarChats()
    }, [])

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
                {/* Izquierda: Sidebar de chats */}
                <ChatSidebar 
                    chats={chats} 
                    chatActivo={chatActivo}
                    onSeleccionar={setChatActivo}
                    getNombreChat={getNombreChat}
                />
                
                {/* Derecha: Área de mensajes */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 relative z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                    {chatActivo ? (
                        <>
                            {/* Cabecera del chat activo */}
                            <div className="h-20 border-b flex items-center px-6 bg-white dark:bg-slate-950 shrink-0 z-10 shadow-sm relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold text-xl shadow-md border border-primary/20">
                                        {getNombreChat(chatActivo).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-tight tracking-tight">
                                            {getNombreChat(chatActivo)}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">En línea</span>
                                        </div>
                                    </div>
                                    
                                    {usuario?.rol === 'TUTOR' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="ml-auto bg-primary/5 text-primary hover:bg-primary/10 border-primary/20"
                                            onClick={() => setDialogOpen(true)}
                                        >
                                            <CalendarPlus className="w-4 h-4 mr-2" /> Agendar Sesión
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
