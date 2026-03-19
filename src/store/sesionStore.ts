import { create } from 'zustand'
import type { SesionResponse } from '../types'

interface SesionState {
    sesiones: SesionResponse[]
    cargando: boolean
    setSesiones: (sesiones: SesionResponse[]) => void
    agregarSesion: (sesion: SesionResponse) => void
    actualizarSesion: (sesion: SesionResponse) => void
    setCargando: (cargando: boolean) => void
    limpiar: () => void
}

export const useSesionStore = create<SesionState>((set) => ({
    sesiones: [],
    cargando: false,
    
    setSesiones: (sesiones) => set({ sesiones }),
    
    agregarSesion: (sesion) => set((state) => ({ 
        sesiones: [sesion, ...state.sesiones] 
    })),
    
    actualizarSesion: (sesion) => set((state) => ({
        sesiones: state.sesiones.map(s => s.id === sesion.id ? sesion : s)
    })),
    
    setCargando: (cargando) => set({ cargando }),
    
    limpiar: () => set({ sesiones: [], cargando: false })
}))
