import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Heart, 
  Brain, 
  Palette, 
  Camera, 
  Mic, 
  Settings, 
  User,
  Shield,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useCompanionStore } from '@/store/companionStore'

const navigation = [
  { name: 'Builder', href: '/builder', icon: User },
  { name: 'Bonding', href: '/bonding', icon: Heart },
  { name: 'Memories', href: '/memories', icon: Brain },
  { name: 'Scenes', href: '/scenes', icon: Camera },
  { name: 'Voice', href: '/voice', icon: Mic },
  { name: 'Outfits', href: '/outfits', icon: Palette },
]

export const Sidebar = () => {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { activeCompanion } = useCompanionStore()

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      {/* Header */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">AI Companion</h1>
      </div>

      {/* Active Companion */}
      {activeCompanion && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-companion-pink to-companion-purple rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {activeCompanion.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{activeCompanion.name}</p>
              <p className="text-sm text-gray-500">Active Companion</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}

        {/* Admin Link */}
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              router.pathname === '/admin'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Shield className="w-5 h-5 mr-3" />
            Admin
          </Link>
        )}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}