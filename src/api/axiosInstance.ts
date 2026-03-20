import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
})

axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status
        const url = error.config?.url ?? ''

        if (status === 401 && !url.includes('/auth/')) {
            // Token expired or invalid — log out and redirect
            useAuthStore.getState().logout()
            window.location.href = '/login'
        }

        if (status === 403) {
            console.error('--- ERROR 403 DETECTADO ---')
            console.error('URL fallida:', url)
            console.error('Detalle error:', error.response?.data)
            // Valid token but insufficient permissions — do NOT log out or redirect automatically
            // Para debuggear, permitimos que el componente maneje el error en lugar de sacar al usuario.
            // window.location.href = '/unauthorized'
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
