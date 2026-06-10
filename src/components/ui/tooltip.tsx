import type { ReactNode } from 'react'

interface TooltipProps {
    text: string
    children: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
}

const positionClasses: Record<NonNullable<TooltipProps['position']>, string> = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
}

export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
    return (
        <div className="relative group inline-flex">
            {children}
            <span className={`
                absolute ${positionClasses[position]} z-50
                px-2 py-1 text-xs font-medium text-white
                bg-slate-800 dark:bg-slate-700 rounded whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-opacity duration-150
            `}>
                {text}
            </span>
        </div>
    )
}
