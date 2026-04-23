import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useSocket } from './useSocket'

interface BondingData {
  id: string
  bondLevel: number
  trustScore: number
  intimacyLevel: string
  sharedMemories: number
  lastInteraction: string
}

export const useBonding = (userId: string, companionId: string) => {
  const [bonding, setBonding] = useState<BondingData | null>(null)
  const [loading, setLoading] = useState(true)
  const { socket } = useSocket()

  useEffect(() => {
    if (userId && companionId) {
      fetchBonding()
    }
  }, [userId, companionId])

  useEffect(() => {
    if (socket) {
      socket.on('bondingUpdate', (data: BondingData) => {
        setBonding(data)
      })

      return () => {
        socket.off('bondingUpdate')
      }
    }
  }, [socket])

  const fetchBonding = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/bonding/${userId}/${companionId}`)
      setBonding(response.data)
    } catch (error) {
      console.error('Failed to fetch bonding:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBondLevel = async (updates: Partial<BondingData>) => {
    try {
      const response = await api.put(`/bonding/${userId}/${companionId}`, updates)
      setBonding(response.data)
      return true
    } catch (error) {
      return false
    }
  }

  return {
    bonding,
    loading,
    updateBondLevel,
    refresh: fetchBonding
  }
}