import { useState, type ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useWebSocket } from '../../hooks/useWebSocket'

interface Props {
    children: ReactNode
}

export const DashboardLayout = ({ children }: Props) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    // Inicializa la conexión STOMP singleton para toda la sesión autenticada
    useWebSocket()

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
    const closeSidebar = () => setIsSidebarOpen(false)

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Navbar onMenuClick={toggleSidebar} />
            
            <div className="flex flex-1 overflow-hidden relative">
                {/* Overlay para móvil */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                        onClick={closeSidebar}
                    />
                )}

                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
