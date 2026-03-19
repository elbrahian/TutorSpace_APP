import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { CardTitle } from '../../components/ui/card'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const { login, loading, error } = useAuth()
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginForm) => {
        try {
            await login(data)
        } catch (e) {
            // Error is handled by useAuth hook
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
                <div className="p-6 md:p-8 lg:p-10 space-y-4 text-center pb-8 border-b border-slate-100 dark:border-slate-800/60 mb-6">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <BookOpen className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        TutorSpace
                    </CardTitle>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Acceso a la plataforma de tutorías</p>
                </div>

                <div className="p-6 md:p-8 lg:p-10 pt-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm font-medium border border-red-200 dark:border-red-800/50">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">
                                Correo Institucional
                            </label>
                            <Input
                                type="email"
                                placeholder="usuario@uco.net.co"
                                {...register('email')}
                                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">
                                Contraseña
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11 mt-6 text-sm font-bold shadow-md hover:shadow-lg transition-all" disabled={loading}>
                            {loading ? 'Iniciando sesión...' : 'Ingresar'}
                        </Button>

                        <div className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
                            ¿No tienes una cuenta?{' '}
                            <Link to="/register" className="font-semibold text-primary hover:text-primary/80 hover:underline">
                                Regístrate aquí
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
