import { create } from 'zustand'
import api from '@/lib/api'

interface Companion {
  id: string
  name: string
  personality: any
  appearance: any
  preferences: any
  isActive: boolean
}

interface CompanionState {
  companions: Companion[]
  activeCompanion: Companion | null
  loading: boolean
  fetchCompanions: (userId: string) => Promise<void>
  createCompanion: (data: any) => Promise<boolean>
  setActiveCompanion: (companion: Companion) => void
}

export const useCompanionStore = create<CompanionState>((set, get) => ({
  companions: [],
  activeCompanion: null,
  loading: true,

  fetchCompanions: async (userId: string) => {
    try {
      set({ loading: true })
      const response = await api.get(`/companions/${userId}`)
      const companions = response.data
      
      set({ 
        companions, 
        activeCompanion: companions[0] || null,
        loading: false 
      })
    } catch (error) {
      set({ loading: false })
    }
  },

  createCompanion: async (data: any) => {
    try {
      const response = await api.post('/companions', data)
      const newCompanion = response.data
      
      set(state => ({
        companions: [...state.companions, newCompanion],
        activeCompanion: newCompanion
      }))
      
      return true
    } catch (error) {
      return false
    }
  },

  setActiveCompanion: (companion: Companion) => {
    set({ activeCompanion: companion })
  }
}))