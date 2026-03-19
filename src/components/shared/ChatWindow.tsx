import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { chatApi } from '../../api/chatApi'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useWebSocket } from '../../hooks/useWebSocket'

export const ChatWindow = () => {
    const usuario = useAuthStore(state => state.usuario)
    const chatActivo = useChatStore(state => state.chatActivo)
    const mensajes = useChatStore(state => state.mensajes)
    const setMensajes = useChatStore(state => state.setMensajes)

    const [contenido, setContenido] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Initialize generic socket connection
    useWebSocket()

    useEffect(() => {
        if (chatActivo) {
            cargarMensajes()
        }
    }, [chatActivo])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [mensajes])

    const cargarMensajes = async () => {
        if (!chatActivo) return
        try {
            const resp = await chatApi.getMensajes(chatActivo.id)
            setMensajes(resp.content.reverse())
        } catch (e) {
            console.error('Error al cargar mensajes', e)
        }
    }

    const enviar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!contenido.trim() || !chatActivo) return

        try {
            setLoading(true)
            await chatApi.enviarMensaje(chatActivo.id, contenido)
            setContenido('')
        } catch (error) {
            console.error('Error al enviar', error)
        } finally {
            setLoading(false)
        }
    }

    if (!chatActivo) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                Selecciona un chat para comenzar a enviar mensajes
            </div>
        )
    }

    const elOtroNombre = usuario?.rol === 'TUTOR' ? chatActivo.nombreEstudiante : chatActivo.nombreTutor

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-card">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-transparent font-semibold text-lg flex items-center shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                Chat con {elOtroNombre}
            </div>

            {/* Messages View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensajes.map((m) => {
                    const mio = m.emisorId === usuario?.id
                    return (
                        <div key={m.id} className={`flex ${mio ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[75%] px-4 py-2.5 text-sm shadow-sm ${mio
                                        ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-br-sm'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border text-foreground rounded-2xl rounded-bl-sm'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap word-break">{m.contenido}</p>
                                <div className={`text-[10px] mt-1 opacity-70 ${mio ? 'text-right' : 'text-left'}`}>
                                    {new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={enviar} className="p-4 border-t bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                <Input
                    className="flex-1"
                    placeholder="Escribe un mensaje..."
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    disabled={loading}
                />
                <Button type="submit" size="icon" disabled={loading || !contenido.trim()}>
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    )
}

export default ChatWindow
