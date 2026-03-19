import axiosInstance from './axiosInstance'
import type { AuthResponse } from '../types'

export const authApi = {
    login: async (data: any): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/login', data)
        return response.data
    },

    register: async (data: any): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth/register', data)
        return response.data
    }
}
