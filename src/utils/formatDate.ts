export const formatDate = (dateValue: string | Date | number): string => {
    try {
        const d = new Date(dateValue)
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
