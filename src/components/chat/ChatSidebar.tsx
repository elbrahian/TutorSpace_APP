import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MessageSquare, ArrowLeft } from 'lucide-react'
import type { ChatResponse } from '../../types'

interface ChatSidebarProps {
    chats: ChatResponse[]
    chatActivo: ChatResponse | null
    onSeleccionar: (chat: ChatResponse) => void
    getNombreChat: (chat: ChatResponse) => string
}

export function ChatSidebar({ chats, chatActivo, onSeleccionar, getNombreChat }: ChatSidebarProps) {
    const [busqueda, setBusqueda] = useState('')
    const navigate = useNavigate()

    const filtrados = chats.filter(c => 
        getNombreChat(c).toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full z-20">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 shadow-sm relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <button 
                        onClick={() => navigate(-1)} // Volver atrás en el historial
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        title="Volver atrás"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Mensajes</h2>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar conversación..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
                {chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 h-full">
                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">Aún no hay mensajes</p>
                    </div>
                ) : filtrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 h-full">
                        <p className="text-sm">No se encontraron chats.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {filtrados.map(chat => {
                            const seleccionado = chatActivo?.id === chat.id
                            const nombre = getNombreChat(chat)
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => onSeleccionar(chat)}
                                    className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative ${seleccionado ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20' : ''}`}
                                >
                                    {seleccionado && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                                    )}
                                    <div className="relative shrink-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg select-none shadow-sm ${
                                            seleccionado ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {nombre.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className={`truncate font-bold ${seleccionado ? 'text-primary' : 'text-slate-900 dark:text-slate-100'}`}>
                                                {nombre}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">
                                                {new Date(chat.fechaCreacion).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <p className="text-[13px] text-slate-500 truncate">
                                            Haz clic para ver los mensajes.
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
