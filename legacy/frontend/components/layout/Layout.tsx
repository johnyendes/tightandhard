import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useCompanionStore } from '@/store/companionStore'
import { Sidebar } from './Sidebar'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter()
  const { user, loading, isAuthenticated, getCurrentUser } = useAuthStore()
  const { fetchCompanions } = useCompanionStore()

  useEffect(() => {
    getCurrentUser()
  }, [getCurrentUser])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCompanions(user.id)
    }
  }, [isAuthenticated, user, fetchCompanions])

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && router.pathname !== '/login' && router.pathname !== '/register') {
    router.push('/login')
    return null
  }

  // Show auth pages without sidebar
  if (router.pathname === '/login' || router.pathname === '/register') {
    return (
      <>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Toaster position="top-right" />
      </>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}