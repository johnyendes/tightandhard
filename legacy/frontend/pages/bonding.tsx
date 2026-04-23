import React from 'react'
import { motion } from 'framer-motion'
import { Heart, TrendingUp, Calendar, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useBonding } from '@/hooks/useBonding'
import { useAuthStore } from '@/store/authStore'
import { useCompanionStore } from '@/store/companionStore'
import { formatDate } from '@/lib/utils'

const intimacyLevels = {
  stranger: { color: 'bg-gray-400', label: 'Stranger' },
  acquaintance: { color: 'bg-yellow-400', label: 'Acquaintance' },
  friend: { color: 'bg-blue-400', label: 'Friend' },
  close_friend: { color: 'bg-green-400', label: 'Close Friend' },
  intimate: { color: 'bg-pink-400', label: 'Intimate' },
  soulmate: { color: 'bg-purple-400', label: 'Soulmate' }
}

export default function BondingPage() {
  const { user } = useAuthStore()
  const { activeCompanion } = useCompanionStore()
  const { bonding, loading } = useBonding(user?.id!, activeCompanion?.id!)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!bonding) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No bonding data available</p>
      </div>
    )
  }

  const intimacyInfo = intimacyLevels[bonding.intimacyLevel as keyof typeof intimacyLevels] || intimacyLevels.stranger

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bonding Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your relationship progress with {activeCompanion?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Bond Level */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bond Level</p>
              <p className="text-3xl font-bold text-gray-900">{bonding.bondLevel}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${bonding.bondLevel}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Trust Score */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trust Score</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(bonding.trustScore * 100)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Intimacy Level */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Intimacy Level</p>
              <Badge variant="info" className="mt-2">
                {intimacyInfo.label}
              </Badge>
            </div>
            <div className={`p-3 ${intimacyInfo.color} rounded-full`}>
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shared Memories */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shared Memories</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Memories</p>
                <p className="text-sm text-gray-600">Collected together</p>
              </div>
              <span className="text-2xl font-bold text-primary-600">
                {bonding.sharedMemories}
              </span>
            </div>
          </div>
        </Card>

        {/* Bonding Timeline */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bonding Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Last interaction: {formatDate(bonding.lastInteraction)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}