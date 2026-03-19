import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthResponse, Rol } from '../types'

interface AuthState {
    token: string | null
    usuario: { id: number; nombre: string; rol: Rol } | null
    login: (data: AuthResponse) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            usuario: null,
            login: (data) =>
                set({
                    token: data.token,
                    usuario: {
                        id: data.id,
                        nombre: data.nombre,
                        rol: data.rol,
                    },
                }),
            logout: () => {
                set({ token: null, usuario: null })
                // Fully clear persisted storage so no stale data remains
                localStorage.removeItem('tutorspace-auth')
            },
        }),
        {
            name: 'tutorspace-auth',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
