import { useEffect, useRef } from 'react'
import type { MensajeResponse } from '../../types'
import { MessageSquareDashed } from 'lucide-react'
import { ChatBubbleSkeleton } from '../ui/skeleton'

interface ChatMessagesProps {
    mensajes: MensajeResponse[]
    usuarioId: number | undefined
    cargando: boolean
}

export function ChatMessages({ mensajes, usuarioId, cargando }: ChatMessagesProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    // Scroll al último mensaje siempre que cambian
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [mensajes])

    if (cargando) {
        return <ChatBubbleSkeleton />
    }

    if (mensajes.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 dark:bg-slate-950/50">
                <MessageSquareDashed className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No hay mensajes aún.</p>
                <p className="text-sm mt-1">¡Sé el primero en saludar!</p>
            </div>
        )
    }

    // Identificar si debemos mostrar el nombre del emisor (si los mensajes seguidos son de la misma persona)
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
            {mensajes.map((m, index) => {
                const esMio = m.emisorId === usuarioId
                const mensajeAnterior = index > 0 ? mensajes[index - 1] : null
                const mostrarNombre = !esMio && (!mensajeAnterior || mensajeAnterior.emisorId !== m.emisorId)

                return (
                    <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${esMio ? 'items-end' : 'items-start'}`}>
                            {mostrarNombre && (
                                <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">
                                    {m.nombreEmisor}
                                </span>
                            )}
                            <div
                                className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed relative group ${
                                    esMio
                                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700'
                                }`}
                            >
                                <p className="whitespace-pre-wrap word-break">{m.contenido}</p>
                                <span className={`text-[10px] mt-1.5 flex select-none ${esMio ? 'justify-end text-primary-foreground/70' : 'justify-start text-slate-400'}`}>
                                    {new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
            <div ref={bottomRef} className="h-1" />
        </div>
    )
}
