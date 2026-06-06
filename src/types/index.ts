export type Rol = 'ESTUDIANTE' | 'TUTOR' | 'ADMIN'
export type EstadoSesion = 'PENDIENTE' | 'APROBADA' | 'CANCELADA' | 'COMPLETADA'
export type EstadoDisponibilidad = 'DISPONIBLE' | 'BLOQUEADA'
export type TipoNotificacion = 'NUEVO_MENSAJE' | 'SESION_CREADA' | 'CAMBIO_ESTADO'

export interface AuthResponse {
    token: string
    rol: Rol
    nombre: string
    id: number
}

export interface TutorResponse {
    id: number
    nombre: string
    email: string
    jornadaGeneral: string
    estado: 'ACTIVO' | 'INACTIVO'
    materias: MateriaResponse[]
}

export interface TutorBusquedaResponse {
    id: number
    nombre: string
    jornadaGeneral: string
    materias: MateriaResponse[]
    diasDisponibles: string[]
}

export interface MateriaResponse {
    id: number
    nombre: string
    codigo: string
}

export interface DisponibilidadResponse {
    id: number
    dia: string
    horaInicio: string
    horaFin: string
    estado: EstadoDisponibilidad
}

export interface SesionResponse {
    id: number
    tutorId: number
    nombreTutor: string
    estudianteId: number
    nombreEstudiante: string
    fecha: string
    horaInicio: string
    horaFin: string
    estado: EstadoSesion
    createdAt: string
}

export interface EvaluacionEstudianteRequest {
    puntuacion: number
    observaciones?: string
}

export interface EvaluacionEstudianteResponse {
    id: number
    sesionId: number
    estudianteId: number
    tutorId: number
    puntuacion: number
    observaciones?: string
    creadoEn: string
}

export interface MensajeResponse {
    id: number
    emisorId: number
    nombreEmisor: string
    contenido: string
    fecha: string
}

export interface ChatResponse {
    id: number
    tutorId: number
    nombreTutor: string
    estudianteId: number
    nombreEstudiante: string
    fechaCreacion: string
}

export interface Notificacion {
    id: number
    tipo: TipoNotificacion
    mensaje: string
    fecha: string
    leida: boolean
}

export interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    number: number
}
