import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '../ui/button'

interface ChatInputProps {
    onEnviar: (contenido: string) => void
    deshabilitado?: boolean
}

export function ChatInput({ onEnviar, deshabilitado }: ChatInputProps) {
    const [mensaje, setMensaje] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Ajustar altura automáticamente
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
        }
    }, [mensaje])

    const handleSend = () => {
        if (!mensaje.trim() || deshabilitado) return
        onEnviar(mensaje.trim())
        setMensaje('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault() // evitar el salto de línea default
            handleSend()
        }
    }

    return (
        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-end gap-2 bg-slate-100 dark:bg-slate-900 rounded-2xl p-2 md:p-3 border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all shadow-sm">
                <textarea
                    ref={textareaRef}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={deshabilitado}
                    placeholder={deshabilitado ? "No hay chat seleccionado..." : "Mensaje..."}
                    className="flex-1 bg-transparent border-0 resize-none max-h-[120px] focus:ring-0 text-slate-900 dark:text-slate-100 text-sm py-2 px-3 placeholder:text-slate-400 disabled:opacity-50 scrollbar-thin outline-none"
                    rows={1}
                />
                <Button 
                    onClick={handleSend}
                    disabled={deshabilitado || !mensaje.trim()}
                    size="icon"
                    className="rounded-full shadow-sm mb-0.5 shrink-0"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
            <div className="text-center mt-2 group">
                <span className="text-[10px] text-slate-400 select-none">Presiona Enter para enviar. Shift + Enter para nueva línea.</span>
            </div>
        </div>
    )
}
