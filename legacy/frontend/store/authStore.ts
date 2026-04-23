import { create } from 'zustand'
import api from '@/lib/api'

interface User {
  id: string
  username: string
  email: string
  role: string
  profile: any
  settings: any
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  getCurrentUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      set({ token, user, isAuthenticated: true })
      
      return true
    } catch (error) {
      return false
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      set({ token, user, isAuthenticated: true })
      
      return true
    } catch (error) {
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        set({ loading: false })
        return
      }

      const response = await api.get('/auth/me')
      set({ 
        user: response.data.user, 
        token, 
        isAuthenticated: true, 
        loading: false 
      })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, token: null, isAuthenticated: false, loading: false })
    }
  }
}))