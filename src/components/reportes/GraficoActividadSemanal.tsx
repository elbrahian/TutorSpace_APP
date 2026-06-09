import { useMemo } from 'react'
import type { ActividadSemanalResponse } from '../../types'

interface GraficoActividadSemanalProps {
    datos: ActividadSemanalResponse[]
}

type Serie = {
    clave: 'estudiante' | 'tutor' | 'admin'
    label: string
    color: string
}

const series: Serie[] = [
    { clave: 'estudiante', label: 'Estudiantes', color: '#2563eb' },
    { clave: 'tutor', label: 'Tutores', color: '#16a34a' },
    { clave: 'admin', label: 'Administradores', color: '#f59e0b' },
]

const ANCHO = 760
const ALTO = 300
const MARGEN = { top: 20, right: 24, bottom: 48, left: 44 }

export const GraficoActividadSemanal = ({ datos }: GraficoActividadSemanalProps) => {
    const { puntosPorSerie, maxValor, ticksY, anchoInterno, altoInterno } = useMemo(() => {
        const anchoInterno = ANCHO - MARGEN.left - MARGEN.right
        const altoInterno = ALTO - MARGEN.top - MARGEN.bottom

        const max = Math.max(
            1,
            ...datos.map((d) => Math.max(d.estudiante, d.tutor, d.admin)),
        )
        // Redondea el tope a un número "amable" para los ejes.
        const maxValor = Math.ceil(max / 4) * 4 || 4

        const x = (i: number) => {
            if (datos.length <= 1) return MARGEN.left + anchoInterno / 2
            return MARGEN.left + (anchoInterno * i) / (datos.length - 1)
        }
        const y = (valor: number) => MARGEN.top + altoInterno - (altoInterno * valor) / maxValor

        const puntosPorSerie = series.map((serie) => ({
            ...serie,
            puntos: datos.map((d, i) => ({ cx: x(i), cy: y(d[serie.clave]), valor: d[serie.clave] })),
        }))

        const ticksY = Array.from({ length: 5 }, (_, i) => {
            const valor = (maxValor / 4) * i
            return { valor, y: y(valor) }
        })

        return { puntosPorSerie, maxValor, ticksY, anchoInterno, altoInterno }
    }, [datos])

    if (datos.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No hay actividad registrada en el período seleccionado.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {series.map((serie) => (
                    <div key={serie.clave} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: serie.color }} />
                        {serie.label}
                    </div>
                ))}
            </div>

            <svg
                viewBox={`0 0 ${ANCHO} ${ALTO}`}
                className="w-full"
                role="img"
                aria-label="Gráfico de actividad semanal por rol"
            >
                {/* Líneas guía horizontales y etiquetas del eje Y */}
                {ticksY.map((tick) => (
                    <g key={tick.valor}>
                        <line
                            x1={MARGEN.left}
                            y1={tick.y}
                            x2={MARGEN.left + anchoInterno}
                            y2={tick.y}
                            stroke="#e2e8f0"
                            strokeWidth={1}
                        />
                        <text x={MARGEN.left - 8} y={tick.y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                            {Math.round(tick.valor)}
                        </text>
                    </g>
                ))}

                {/* Etiquetas del eje X (semanas) */}
                {datos.map((d, i) => {
                    const cx =
                        datos.length <= 1
                            ? MARGEN.left + anchoInterno / 2
                            : MARGEN.left + (anchoInterno * i) / (datos.length - 1)
                    return (
                        <text
                            key={d.inicioSemana}
                            x={cx}
                            y={MARGEN.top + altoInterno + 20}
                            textAnchor="middle"
                            className="fill-slate-500 text-[10px]"
                        >
                            {d.semana}
                        </text>
                    )
                })}

                {/* Series */}
                {puntosPorSerie.map((serie) => (
                    <g key={serie.clave}>
                        <polyline
                            fill="none"
                            stroke={serie.color}
                            strokeWidth={2.5}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            points={serie.puntos.map((p) => `${p.cx},${p.cy}`).join(' ')}
                        />
                        {serie.puntos.map((p, i) => (
                            <circle key={i} cx={p.cx} cy={p.cy} r={3} fill={serie.color}>
                                <title>{`${serie.label} · ${datos[i].semana}: ${p.valor}`}</title>
                            </circle>
                        ))}
                    </g>
                ))}

                {/* Eje X base */}
                <line
                    x1={MARGEN.left}
                    y1={MARGEN.top + altoInterno}
                    x2={MARGEN.left + anchoInterno}
                    y2={MARGEN.top + altoInterno}
                    stroke="#cbd5e1"
                    strokeWidth={1}
                />
                <title>{`Máximo de actividad semanal: ${maxValor}`}</title>
            </svg>
        </div>
    )
}
