import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, MessageSquare, Calendar, RefreshCw } from 'lucide-react'
import { useNotificaciones } from '../../hooks/useNotificaciones'
import { tiempoRelativo } from '../../utils/formatDate'

export const NotificacionBell = () => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas } = useNotificaciones()

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const getIcono = (tipo: string) => {
        switch (tipo) {
            case 'NUEVO_MENSAJE': return <MessageSquare className="w-5 h-5 text-blue-500" />
            case 'SESION_CREADA': return <Calendar className="w-5 h-5 text-green-500" />
            case 'CAMBIO_ESTADO': return <RefreshCw className="w-5 h-5 text-amber-500" />
            default: return <Bell className="w-5 h-5 text-slate-500" />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
                <Bell className="w-[1.125rem] h-[1.125rem] md:w-5 md:h-5 text-slate-600 dark:text-slate-300" />
                {noLeidas > 0 && (
                    <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 border-2 border-white dark:border-slate-950 rounded-full" style={{ paddingBottom: '1px' }}>
                        {noLeidas > 9 ? '9+' : noLeidas}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Notificaciones</h3>
                        {noLeidas > 0 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); marcarTodasLeidas(); }}
                                className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notificaciones.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No tienes notificaciones</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notificaciones.map(n => (
                                    <div 
                                        key={n.id}
                                        onClick={() => !n.leida && marcarLeida(n.id)}
                                        className={`p-4 flex gap-3 cursor-pointer transition-colors ${
                                            n.leida ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800' 
                                            : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                        }`}
                                    >
                                        <div className="shrink-0 mt-0.5">
                                            {getIcono(n.tipo)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!n.leida ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {n.mensaje}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1.5 font-medium">
                                                {tiempoRelativo(n.fecha)}
                                            </p>
                                        </div>
                                        {!n.leida && (
                                            <div className="shrink-0 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                        <Link 
                            to="/notificaciones"
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-slate-500 font-medium hover:text-primary transition-colors block py-1"
                        >
                            Ver todas las notificaciones
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
