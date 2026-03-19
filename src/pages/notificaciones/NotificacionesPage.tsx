import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent } from '../../components/ui/card'
import { Bell, MessageSquare, Calendar, RefreshCw } from 'lucide-react'
import { useNotificaciones } from '../../hooks/useNotificaciones'
import { tiempoRelativo } from '../../utils/formatDate'

export default function NotificacionesPage() {
    const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas } = useNotificaciones()

    const getIcono = (tipo: string) => {
        switch (tipo) {
            case 'NUEVO_MENSAJE': return <MessageSquare className="w-6 h-6 text-blue-500" />
            case 'SESION_CREADA': return <Calendar className="w-6 h-6 text-green-500" />
            case 'CAMBIO_ESTADO': return <RefreshCw className="w-6 h-6 text-amber-500" />
            default: return <Bell className="w-6 h-6 text-slate-500" />
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <Bell className="w-8 h-8 text-primary" />
                            Historial de Notificaciones
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Revisa el historial completo de tus notificaciones y alertas.
                        </p>
                    </div>
                    {noLeidas > 0 && (
                        <button 
                            onClick={marcarTodasLeidas}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
                        >
                            Marcar todas como leídas
                        </button>
                    )}
                </div>

                <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                        {notificaciones.length === 0 ? (
                            <div className="p-16 text-center text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Todo al día</h3>
                                <p className="text-sm">Por ahora no tienes notificaciones antiguas ni recientes.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
                                {notificaciones.map(n => (
                                    <div 
                                        key={n.id}
                                        onClick={() => !n.leida && marcarLeida(n.id)}
                                        className={`p-6 flex gap-4 transition-colors ${
                                            n.leida 
                                                ? 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900' 
                                                : 'bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 cursor-pointer'
                                        }`}
                                    >
                                        <div className="shrink-0 mt-1">
                                            <div className={`p-3 rounded-full ${n.leida ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'}`}>
                                                {getIcono(n.tipo)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <p className={`text-base ${!n.leida ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                                                    {n.mensaje}
                                                </p>
                                                <p className="text-sm text-slate-400 shrink-0 mt-1 font-medium whitespace-nowrap">
                                                    {tiempoRelativo(n.fecha)}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                                                {n.tipo.replace('_', ' ')}
                                            </p>
                                        </div>
                                        {!n.leida && (
                                            <div className="shrink-0 flex items-center justify-center pl-2">
                                                <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
