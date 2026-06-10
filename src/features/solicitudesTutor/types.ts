export type EstadoSolicitudTutor = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
export type EstadoRevisionSolicitudTutor = Exclude<EstadoSolicitudTutor, 'PENDIENTE'>

export interface MateriaSolicitudTutor {
    id: number
    nombre: string
    codigo: string
}

export interface SolicitudTutorResponse {
    id: number
    solicitanteId: number
    nombreSolicitante: string
    emailSolicitante: string
    justificacion: string
    observaciones: string | null
    estado: EstadoSolicitudTutor
    fechaEnvio: string
    fechaRevision: string | null
    materias: MateriaSolicitudTutor[]
}

export interface CrearSolicitudTutorRequest {
    materiaIds: number[]
    justificacion: string
}

export interface RevisarSolicitudTutorRequest {
    nuevoEstado: EstadoRevisionSolicitudTutor
    observaciones: string | null
}

export interface FiltrosSolicitudTutor {
    estado?: EstadoSolicitudTutor
    inicio?: string
    fin?: string
}
