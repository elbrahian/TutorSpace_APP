import type { ActividadMensual } from '../../api/estadisticasApi'

interface Props {
    datos: ActividadMensual[]
}

const ALTURA_GRAFICO = 128

export function ActividadMensualChart({ datos }: Props) {
    const puntos = Array.isArray(datos) ? datos : []

    if (puntos.length === 0) {
        return (
            <div className="text-center p-6 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                Sin actividad registrada este año.
            </div>
        )
    }

    const maxSesiones = Math.max(...puntos.map((d) => d.sesiones), 1)

    return (
        <div className="flex items-end gap-2 w-full" style={{ height: ALTURA_GRAFICO }}>
            {puntos.map((d) => {
                const alturaPx = Math.max(
                    Math.round((d.sesiones / maxSesiones) * ALTURA_GRAFICO),
                    d.sesiones > 0 ? 4 : 0
                )
                const etiquetaMes = d.nombreMes ? d.nombreMes.slice(0, 3) : `M${d.mes}`

                return (
                    <div key={d.mes} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {d.sesiones}
                        </span>
                        <div
                            className="w-full rounded-t-md bg-primary/80 transition-all duration-500"
                            style={{ height: alturaPx }}
                        />
                        <span className="text-[10px] text-slate-400 truncate w-full text-center">
                            {etiquetaMes}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
