// Props del componente de mensaje automatico del sistema (MNT-05)
interface MensajeSistemaProps {
    contenido: string
}

// Renderiza mensajes automaticos centrados, en gris y cursiva
// Se muestra cuando esSistema = true en ChatMessages
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