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
    calificada: boolean
}

// MNT-12 — Evaluación de la sesión por el estudiante
export interface CalificacionSesionRequest {
    calificacion: number
    comentario?: string
}

export interface CalificacionSesionResponse {
    calificacionId: number
    sesionId: number
    nombreTutor: string
    calificacion: number
    comentario?: string
    fecha: string
    horaInicio: string
    mensaje: string
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

export interface ReporteDesempenoTutorResponse {
    tutorId: number
    nombreTutor: string
    totalSesiones: number
    sesionesCompletadas: number | null
    sesionesCanceladas: number
    porcentajeCancelacion: number
    promedioCalificacion: number | null
}

export interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    number: number
}

export interface AuditoriaSesionResponse {
    sesionId: number
    tutor: string
    estudiante: string
    estadoAnterior: string
    estadoNuevo: string
    fechaCambio: string
}

// MNT-09 - Reporte de Oferta y Demanda de Tutores
export interface MateriaDemandaResponse {
    materia: string
    sesionesSolicitadas: number
    tutoresDisponibles: number
    tasaCobertura: number | null
}

export interface ReporteDemandaResponse {
    materias: MateriaDemandaResponse[]
    top5MayorDemanda: MateriaDemandaResponse[]
    top5MenorDemanda: MateriaDemandaResponse[]
}

// MNT-11 - Reporte de Uso de la Plataforma por Rol
export interface UsoPorRolResponse {
    rol: Rol
    usuariosActivos: number
    sesiones: number
    mensajesEnviados: number
}

export interface ActividadSemanalResponse {
    semana: string
    inicioSemana: string
    estudiante: number
    tutor: number
    admin: number
}

export interface ReporteUsoResponse {
    estudiantesActivos: number
    tutoresActivos: number
    adminsActivos: number
    totalSesionesCreadas: number
    totalMensajesEnviados: number
    metricasPorRol: UsoPorRolResponse[]
    actividadSemanal: ActividadSemanalResponse[]
}

// MNT-10 - Reporte de Calificación de Tutores
export interface ComentarioCalificacionTutorResponse {
    calificacionId: number
    tutorId: number
    nombreEstudiante: string
    calificacion: number
    comentario: string
    fechaSesion: string
}

export interface ReporteCalificacionTutorResponse {
    tutorId: number
    nombreTutor: string
    promedioCalificacion: number
    totalEvaluaciones: number
    estrellas1: number
    estrellas2: number
    estrellas3: number
    estrellas4: number
    estrellas5: number
    comentarios: ComentarioCalificacionTutorResponse[]
}
