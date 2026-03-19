import { useState } from 'react'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loginStore = useAuthStore((state) => state.login)
    const logoutStore = useAuthStore((state) => state.logout)
    const navigate = useNavigate()

    const login = async (data: any) => {
        try {
            setLoading(true)
            setError(null)
            const res = await authApi.login(data)
            loginStore(res)

            if (res.rol === 'ADMIN') navigate('/admin')
            else if (res.rol === 'TUTOR') navigate('/tutor')
            else navigate('/estudiante')

        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const register = async (data: any) => {
        try {
            setLoading(true)
            setError(null)
            const res = await authApi.register(data)
            loginStore(res)
            navigate('/estudiante')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrarse')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        logoutStore()
        navigate('/login')
    }

    return { login, register, logout, loading, error }
}
