import { create } from 'zustand'
import type { ChatResponse, MensajeResponse } from '../types'

interface ChatState {
    chats: ChatResponse[]
    chatActivo: ChatResponse | null
    mensajes: MensajeResponse[]
    cargando: boolean
    setChats: (chats: ChatResponse[]) => void
    setChatActivo: (chat: ChatResponse | null) => void
    setMensajes: (ms: MensajeResponse[]) => void
    agregarMensaje: (m: MensajeResponse) => void
    setCargando: (c: boolean) => void
    limpiar: () => void
}

export const useChatStore = create<ChatState>((set) => ({
    chats: [],
    chatActivo: null,
    mensajes: [],
    cargando: false,

    setChats: (chats) => set({ chats }),
    
    setChatActivo: (chat) => set({ chatActivo: chat, mensajes: [] }),
    
    setMensajes: (ms) => set({ mensajes: ms }),

    agregarMensaje: (m) => set((state) => {
        // Evitar duplicados por id
        if (state.mensajes.some(msg => msg.id === m.id)) {
            return state;
        }
        return { mensajes: [...state.mensajes, m] };
    }),

    setCargando: (cargando) => set({ cargando }),
    
    limpiar: () => set({ chats: [], chatActivo: null, mensajes: [], cargando: false })
}))
