import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, MessageSquare, BookOpen, Clock, BarChart3, Activity, ChevronDown, Star } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../store/authStore'

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

type LinkItem = {
    type: 'link'
    name: string
    path: string
    icon: ReactNode
}

type SectionItem = {
    type: 'section'
    name: string
    icon: ReactNode
    children: LinkItem[]
}

type NavigationItem = LinkItem | SectionItem

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const usuario = useAuthStore((state) => state.usuario)
    const location = useLocation()
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

    if (!usuario) return null

    const getLinks = (): NavigationItem[] => {
        switch (usuario.rol) {
            case 'ADMIN':
                return [
                    { type: 'link', name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
                    { type: 'link', name: 'Tutores', path: '/admin/tutores', icon: <Users className="w-5 h-5" /> },
                    { type: 'link', name: 'Materias', path: '/admin/materias', icon: <BookOpen className="w-5 h-5" /> },
                    {type: 'link',name: 'Auditoría',path: '/admin/auditoria',icon: <Activity className="w-5 h-5" />},
                    {
                        type: 'section',
                        name: 'Reportes',
                        icon: <BarChart3 className="w-5 h-5" />,
                        children: [
                            { type: 'link', name: 'Desempeño', path: '/admin/reportes/tutores', icon: <Activity className="w-4 h-4" /> },
                        ],
                    },
                ]
            case 'TUTOR':
                return [
                    { type: 'link', name: 'Dashboard', path: '/tutor', icon: <LayoutDashboard className="w-5 h-5" /> },
                    { type: 'link', name: 'Disponibilidad', path: '/tutor/disponibilidad', icon: <Clock className="w-5 h-5" /> },
                    { type: 'link', name: 'Sesiones', path: '/tutor/sesiones', icon: <Calendar className="w-5 h-5" /> },
                    { type: 'link', name: 'Evaluar estudiante', path: '/tutor/evaluaciones', icon: <Star className="w-5 h-5" /> },
                    { type: 'link', name: 'Chat', path: '/tutor/chat', icon: <MessageSquare className="w-5 h-5" /> },
                    { type: 'link', name: 'Mis Materias', path: '/tutor/materias', icon: <BookOpen className="w-5 h-5" /> },
                ]
            case 'ESTUDIANTE':
                return [
                    { type: 'link', name: 'Dashboard', path: '/estudiante', icon: <LayoutDashboard className="w-5 h-5" /> },
                    { type: 'link', name: 'Buscar Tutores', path: '/estudiante/buscar', icon: <Users className="w-5 h-5" /> },
                    { type: 'link', name: 'Mis Sesiones', path: '/estudiante/sesiones', icon: <Calendar className="w-5 h-5" /> },
                    { type: 'link', name: 'Chat', path: '/estudiante/chat', icon: <MessageSquare className="w-5 h-5" /> },
                ]
            default:
                return []
        }
    }

    const links: NavigationItem[] = getLinks()

    const toggleSection = (name: string) => {
        setOpenSections((current) => ({
            ...current,
            [name]: !(current[name] ?? false),
        }))
    }

    const renderLink = (link: LinkItem, nested = false) => {
        const isActive = location.pathname === link.path
        return (
            <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg transition-colors ${nested ? 'ml-8 px-3 py-2 text-sm' : 'px-3 py-2.5'} ${isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
            >
                {link.icon}
                {link.name}
            </Link>
        )
    }

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 border-r bg-white dark:bg-slate-900 
            h-screen lg:h-[calc(100vh-4rem)] lg:top-16
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="p-4 border-b flex items-center justify-between lg:hidden bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-primary font-bold text-xl">
                    <BookOpen className="w-6 h-6" />
                    <span>TutorSpace</span>
                </div>
                {/* Botón opcional para cerrar dentro del aside si se prefiere */}
            </div>

            <nav className="p-4 space-y-2">
                {links.map((item) => {
                    if (item.type === 'link') return renderLink(item)

                    const isActive = item.children.some((child) => location.pathname === child.path)
                    const isExpanded = openSections[item.name] ?? false

                    return (
                        <div key={item.name} className="space-y-1.5">
                            <button
                                type="button"
                                onClick={() => toggleSection(item.name)}
                                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${isActive
                                        ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                                <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                                <div className="space-y-1">
                                    {item.children.map((child) => renderLink(child, true))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>
        </aside>
    )
}
