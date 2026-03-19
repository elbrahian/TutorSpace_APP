import { useState } from 'react'
import type { Rol } from '../../types'

const COLOR_POR_ROL: Record<string, string> = {
    ESTUDIANTE: '6366f1',
    TUTOR: '10b981',
    ADMIN: 'f59e0b',
}

const SIZE_CLASSES = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
}

interface AvatarProps {
    nombre: string
    rol?: Rol
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const Avatar = ({ nombre, rol, size = 'md', className = '' }: AvatarProps) => {
    const [error, setError] = useState(false)

    const color = rol ? (COLOR_POR_ROL[rol] ?? '6366f1') : '6366f1'
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=${color}&color=fff&size=128&bold=true`
    const sizeClass = SIZE_CLASSES[size]
    const inicial = nombre.trim().charAt(0).toUpperCase()

    if (error) {
        return (
            <div
                className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}
                style={{ backgroundColor: `#${color}` }}
            >
                {inicial}
            </div>
        )
    }

    return (
        <img
            src={url}
            alt={nombre}
            onError={() => setError(true)}
            className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
        />
    )
}
