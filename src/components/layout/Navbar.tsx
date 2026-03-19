import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { NotificacionBell } from '../shared/NotificacionBell'
import { BookOpen, LogOut } from 'lucide-react'
import { Button } from '../ui/button'

export const Navbar = () => {
    const usuario = useAuthStore((state) => state.usuario)
    const logout = useAuthStore((state) => state.logout)

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }

    // Si no hay usuario, mostrar nav básico público
    if (!usuario) {
        return (
            <nav className="h-16 border-b bg-white dark:bg-slate-950 flex items-center justify-between px-6 sticky top-0 z-40">
                <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
                    <BookOpen className="w-6 h-6" />
                    <span>TutorSpace</span>
                </Link>
            </nav>
        )
    }

    const getDashboardPath = () => {
        if (usuario.rol === 'ADMIN') return '/admin'
        if (usuario.rol === 'TUTOR') return '/tutor'
        return '/estudiante'
    }

    return (
        <nav className="h-16 border-b bg-white dark:bg-slate-950 flex items-center justify-between px-6 sticky top-0 z-40">
            <Link to={getDashboardPath()} className="flex items-center gap-2 text-primary font-bold text-xl">
                <BookOpen className="w-6 h-6" />
                <span>TutorSpace</span>
            </Link>

            <div className="flex items-center gap-4">
                <div className="hidden md:block text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Hola, </span>
                    <span className="font-bold text-primary">{usuario.nombre}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-extrabold text-primary uppercase tracking-wider shadow-sm">
                        {usuario.rol}
                    </span>
                </div>

                <NotificacionBell />

                <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
                    <LogOut className="w-5 h-5 text-slate-500 hover:text-red-500" />
                </Button>
            </div>
        </nav>
    )
}
