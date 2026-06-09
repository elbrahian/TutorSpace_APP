function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className ?? ''}`} />
    )
}

// Variante: tarjeta de tutor (grid de BuscarTutores)
export function TutorCardSkeleton() {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-3 w-1/4" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-14 rounded" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                </div>
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
        </div>
    )
}

// Variante: filas de tabla para sesiones (SesionesTutor / listados)
export function SesionRowSkeleton() {
    return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-28 flex-1" />
            <Skeleton className="h-6 w-20 rounded-full" />
        </div>
    )
}

// Variante: placeholder del calendario de sesiones
export function CalendarSkeleton() {
    return (
        <div className="space-y-3">
            {/* Cabecera del calendario */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                </div>
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                </div>
            </div>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 rounded" />
                ))}
            </div>
            {/* Celdas del mes */}
            {Array.from({ length: 5 }).map((_, row) => (
                <div key={row} className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }).map((_, col) => (
                        <Skeleton key={col} className="h-20 rounded" />
                    ))}
                </div>
            ))}
        </div>
    )
}

// Variante: burbujas de chat
export function ChatBubbleSkeleton() {
    const bubbles = [
        { mine: false, width: 'w-48' },
        { mine: true,  width: 'w-36' },
        { mine: false, width: 'w-64' },
        { mine: true,  width: 'w-52' },
        { mine: false, width: 'w-40' },
        { mine: true,  width: 'w-44' },
    ]
    return (
        <div className="flex-1 overflow-hidden p-4 md:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
            {bubbles.map((b, i) => (
                <div key={i} className={`flex ${b.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col gap-1 ${b.mine ? 'items-end' : 'items-start'}`}>
                        <Skeleton className={`h-10 ${b.width} rounded-2xl ${b.mine ? 'rounded-tr-sm' : 'rounded-tl-sm'}`} />
                        <Skeleton className="h-2.5 w-10" />
                    </div>
                </div>
            ))}
        </div>
    )
}
