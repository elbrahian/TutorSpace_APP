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
            // Valid token but insufficient permissions
            console.error('Acceso denegado a recurso API:', url)
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
