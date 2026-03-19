import axiosInstance from './axiosInstance'
import type { ChatResponse, MensajeResponse, PageResponse } from '../types'

export const chatApi = {
    iniciarChat: async (tutorId: number): Promise<ChatResponse> => {
        const response = await axiosInstance.post('/chat/iniciar', { tutorId })
        return response.data
    },

    getMisChats: async (): Promise<ChatResponse[]> => {
        const response = await axiosInstance.get('/chat')
        return response.data
    },

    getMensajes: async (chatId: number, page: number = 0, size: number = 30): Promise<PageResponse<MensajeResponse>> => {
        const response = await axiosInstance.get(`/chat/${chatId}/mensajes`, {
            params: { page, size }
        })
        return response.data
    },

    enviarMensaje: async (chatId: number, contenido: string): Promise<MensajeResponse> => {
        const response = await axiosInstance.post(`/chat/${chatId}/mensajes`, { contenido })
        return response.data
    }
}
