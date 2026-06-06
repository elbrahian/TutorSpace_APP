import React from 'react'

interface MensajeSistemaProps {
    contenido: string
}

export function MensajeSistema({ contenido }: MensajeSistemaProps) {
    return (
        <div className="flex justify-center my-2 px-4">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 
                            text-slate-500 dark:text-slate-400 text-xs italic 
                            px-4 py-1.5 rounded-full border border-slate-200 
                            dark:border-slate-700 max-w-sm text-center">
                <span>🤖</span>
                <span>{contenido}</span>
            </div>
        </div>
    )
}