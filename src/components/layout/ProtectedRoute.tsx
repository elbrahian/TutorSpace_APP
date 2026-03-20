import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { Rol } from '../../types'

interface ProtectedRouteProps {
    allowedRoles: Rol[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const token = useAuthStore((state) => state.token)
    const usuario = useAuthStore((state) => state.usuario)

    if (!token || !usuario) {
        return <Navigate to="/login" replace />
    }

    if (!allowedRoles.includes(usuario.rol)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}
