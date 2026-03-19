import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { useAuthStore } from '../store/authStore'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// Estudiante Pages
import EstudianteDashboard from '../pages/estudiante/EstudianteDashboard'
import BuscarTutores from '../pages/estudiante/BuscarTutores'
import SesionesEstudiante from '../pages/estudiante/SesionesEstudiante'

// Tutor Pages
import TutorDashboard from '../pages/tutor/TutorDashboard'
import DisponibilidadPage from '../pages/tutor/DisponibilidadPage'
import SesionesTutor from '../pages/tutor/SesionesTutor'
import MisMateriasPage from '../pages/tutor/MisMateriasPage'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import GestionTutores from '../pages/admin/GestionTutores'
import GestionMaterias from '../pages/admin/GestionMaterias'

// Shared Flow
import ChatPage from '../pages/chat/ChatPage'
import NotificacionesPage from '../pages/notificaciones/NotificacionesPage'

const AppRouter = () => {
    const { token, usuario } = useAuthStore()

    const getDefaultRoute = () => {
        if (!token || !usuario) return '/login'
        if (usuario.rol === 'ADMIN') return '/admin'
        if (usuario.rol === 'TUTOR') return '/tutor'
        return '/estudiante'
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<div className="p-8 text-center text-red-500">Acceso Denegado</div>} />

            {/* ESTUDIANTE ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['ESTUDIANTE']} />}>
                <Route path="/estudiante" element={<EstudianteDashboard />} />
                <Route path="/estudiante/buscar" element={<BuscarTutores />} />
                <Route path="/estudiante/sesiones" element={<SesionesEstudiante />} />
                <Route path="/estudiante/chat" element={<ChatPage />} />
            </Route>

            {/* TUTOR ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['TUTOR']} />}>
                <Route path="/tutor" element={<TutorDashboard />} />
                <Route path="/tutor/disponibilidad" element={<DisponibilidadPage />} />
                <Route path="/tutor/sesiones" element={<SesionesTutor />} />
                <Route path="/tutor/chat" element={<ChatPage />} />
                <Route path="/tutor/materias" element={<MisMateriasPage />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/tutores" element={<GestionTutores />} />
                <Route path="/admin/materias" element={<GestionMaterias />} />
            </Route>

            {/* SHARED PROTECTED ROUTES */}
            <Route element={<ProtectedRoute allowedRoles={['ESTUDIANTE', 'TUTOR', 'ADMIN']} />}>
                <Route path="/notificaciones" element={<NotificacionesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default AppRouter
