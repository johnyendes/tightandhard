import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { token } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (token && !socketRef.current) {
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: { token }
      })

      newSocket.on('connect', () => {
        setConnected(true)
        console.log('Socket connected')
      })

      newSocket.on('disconnect', () => {
        setConnected(false)
        console.log('Socket disconnected')
      })

      setSocket(newSocket)
      socketRef.current = newSocket

      return () => {
        newSocket.disconnect()
        socketRef.current = null
      }
    }
  }, [token])

  const joinCompanion = (companionId: string) => {
    if (socket) {
      socket.emit('joinCompanion', companionId)
    }
  }

  const emitEvent = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data)
    }
  }

  return {
    socket,
    connected,
    joinCompanion,
    emitEvent
  }
}