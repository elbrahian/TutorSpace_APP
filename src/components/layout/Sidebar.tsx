import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, MessageSquare, BookOpen, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export const Sidebar = () => {
    const usuario = useAuthStore((state) => state.usuario)
    const location = useLocation()

    if (!usuario) return null

    const getLinks = () => {
        switch (usuario.rol) {
            case 'ADMIN':
                return [
                    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
                    { name: 'Tutores', path: '/admin/tutores', icon: <Users className="w-5 h-5" /> },
                    { name: 'Materias', path: '/admin/materias', icon: <BookOpen className="w-5 h-5" /> },
                ]
            case 'TUTOR':
                return [
                    { name: 'Dashboard', path: '/tutor', icon: <LayoutDashboard className="w-5 h-5" /> },
                    { name: 'Disponibilidad', path: '/tutor/disponibilidad', icon: <Clock className="w-5 h-5" /> },
                    { name: 'Sesiones', path: '/tutor/sesiones', icon: <Calendar className="w-5 h-5" /> },
                    { name: 'Chat', path: '/tutor/chat', icon: <MessageSquare className="w-5 h-5" /> },
                    { name: 'Mis Materias', path: '/tutor/materias', icon: <BookOpen className="w-5 h-5" /> },
                ]
            case 'ESTUDIANTE':
                return [
                    { name: 'Dashboard', path: '/estudiante', icon: <LayoutDashboard className="w-5 h-5" /> },
                    { name: 'Buscar Tutores', path: '/estudiante/buscar', icon: <Users className="w-5 h-5" /> },
                    { name: 'Mis Sesiones', path: '/estudiante/sesiones', icon: <Calendar className="w-5 h-5" /> },
                    { name: 'Chat', path: '/estudiante/chat', icon: <MessageSquare className="w-5 h-5" /> },
                ]
            default:
                return []
        }
    }

    const links = getLinks()

    return (
        <aside className="w-64 border-r bg-slate-50/50 dark:bg-slate-900/50 h-[calc(100vh-4rem)] sticky top-16 hidden md:block">
            <nav className="p-4 space-y-2">
                {links.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            {link.icon}
                            {link.name}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
