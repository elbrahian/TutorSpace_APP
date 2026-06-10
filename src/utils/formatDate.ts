export const formatDate = (dateValue: string | Date | number): string => {
    try {
        // Si es un string de solo fecha (YYYY-MM-DD) se agrega T00:00:00 para que
        // JavaScript lo trate como hora local y no UTC, evitando el desfase de un día.
        const value = typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
            ? dateValue + 'T00:00:00'
            : dateValue
        const d = new Date(value)
        return d.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch (e) {
        return String(dateValue)
    }
}

export const tiempoRelativo = (fecha: string): string => {
    const ahora = new Date()
    const diffMs = ahora.getTime() - new Date(fecha).getTime()
    const diffMinutos = Math.floor(diffMs / 60000)
    
    if (diffMinutos < 1) return 'justo ahora'
    if (diffMinutos < 60) return `hace ${diffMinutos} minuto${diffMinutos === 1 ? '' : 's'}`
    
    const diffHoras = Math.floor(diffMinutos / 60)
    if (diffHoras < 24) return `hace ${diffHoras} hora${diffHoras === 1 ? '' : 's'}`
    
    const diffDias = Math.floor(diffHoras / 24)
    if (diffDias < 30) return `hace ${diffDias} día${diffDias === 1 ? '' : 's'}`
    
    const diffMeses = Math.floor(diffDias / 30)
    return `hace ${diffMeses} mes${diffMeses === 1 ? '' : 'es'}`
}
