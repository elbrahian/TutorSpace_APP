import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { BookOpen, UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

const registerSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string()
        .email('Email inválido')
        .refine((val) => val.endsWith('@uco.net.co'), {
            message: 'El correo debe ser institucional (@uco.net.co)',
        }),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const { register: registerAction, loading, error } = useAuth()

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterForm) => {
        try {
            await registerAction(data)
        } catch (e) {
            // Error handled by hook
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-4 text-center pb-8 border-b border-slate-100 dark:border-slate-800/60 mb-6">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-secondary/20 rounded-full">
                            <UserPlus className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Crea tu cuenta
                    </CardTitle>
                    <p className="text-slate-500 dark:text-slate-400">Únete a TutorSpace como estudiante</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm font-medium border border-red-200 dark:border-red-800/50">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                                Nombre Completo
                            </label>
                            <Input
                                placeholder="Juan Pérez"
                                {...register('nombre')}
                                className={errors.nombre ? 'border-red-500' : ''}
                            />
                            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                                Correo Institucional
                            </label>
                            <Input
                                type="email"
                                placeholder="usuario@uco.net.co"
                                {...register('email')}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                                Contraseña
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11 mt-6 text-sm font-bold shadow-md hover:shadow-lg transition-all" disabled={loading}>
                            {loading ? 'Creando cuenta...' : 'Registrarse'}
                        </Button>

                        <div className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:underline hover:text-primary/80">
                                Inicia sesión aquí
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
