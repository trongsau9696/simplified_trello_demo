import api from '@/api/axios'
import type { AuthResponse } from '@/types'

export const authApi = {
  register: async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', data)
    return res.data
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  logout: async () => {
    await api.post('/auth/logout')
  },
}
