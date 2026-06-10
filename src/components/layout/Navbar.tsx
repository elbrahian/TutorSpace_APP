import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { NotificacionBell } from '../shared/NotificacionBell'
import { Avatar } from '../shared/Avatar'
import { BookOpen, LogOut, Menu } from 'lucide-react'
import { Button } from '../ui/button'

interface NavbarProps {
    onMenuClick?: () => void
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
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
        <nav className="h-16 border-b bg-white dark:bg-slate-950 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-11 w-11"
                    onClick={onMenuClick}
                    aria-label="Abrir menú de navegación"
                >
                    <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Button>
                
                <Link to={getDashboardPath()} className="flex items-center gap-2 text-primary font-bold text-xl">
                    <BookOpen className="w-6 h-6" />
                    <span className="hidden xs:block">TutorSpace</span>
                </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden sm:flex items-center gap-3">
                    <Avatar nombre={usuario.nombre} rol={usuario.rol} size="sm" />
                    <div className="hidden md:block text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Hola, </span>
                        <span className="font-bold text-primary">{usuario.nombre}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-extrabold text-primary uppercase tracking-wider shadow-sm">
                        {usuario.rol}
                    </span>
                </div>


                <NotificacionBell />

                <Button variant="ghost" size="icon" className="h-11 w-11" onClick={handleLogout} aria-label="Cerrar sesión">
                    <LogOut className="w-5 h-5 text-slate-500 hover:text-red-500" />
                </Button>
            </div>
        </nav>
    )
}
