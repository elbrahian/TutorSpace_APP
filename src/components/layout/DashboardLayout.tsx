import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

interface Props {
    children: ReactNode
}

export const DashboardLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
