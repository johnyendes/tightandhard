import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Sparkles, Lock, Unlock, Play, Settings, Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useCompanionStore } from '@/store/companionStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Scene {
  id: string
  name: string
  environment: string
  timeOfDay: string
  weather: string
  lighting: string
  ambiance: any
  isUnlocked: boolean
  isFavorite: boolean
  timesUsed: number
  userRating: number
  description: string
}

const sceneCategories = [
  { id: 'all', name: 'All Scenes', icon: Camera },
  { id: 'romantic', name: 'Romantic', icon: Heart },
  { id: 'nature', name: 'Nature', icon: Sparkles },
  { id: 'urban', name: 'Urban', icon: Settings },
]

export default function ScenesPage() {
  const { user } = useAuthStore()
  const { activeCompanion } = useCompanionStore()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)

  const fetchScenes = async () => {
    setLoading(true)
    try {
      const response = await api.get('/scenes')
      setScenes(response.data)
    } catch (error) {
      toast.error('Failed to load scenes')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchScenes()
  }, [])

  const activateScene = async (sceneId: string) => {
    try {
      await api.post(`/scene/activate/${sceneId}`, { characterId: activeCompanion?.id })
      toast.success('Scene activated!')
    } catch (error) {
      toast.error('Failed to activate scene')
    }
  }

  const filteredScenes = scenes.filter(scene => {
    if (activeCategory === 'all') return true
    // Add logic to filter by category based on scene properties
    return true
  })

  const unlockedScenes = filteredScenes.filter(s => s.isUnlocked)
  const lockedScenes = filteredScenes.filter(s => !s.isUnlocked)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Scene Gallery</h1>
        <p className="text-gray-600 mt-2">Choose environments for your companion interactions</p>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {sceneCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scenes</p>
              <p className="text-2xl font-bold text-gray-900">{scenes.length}</p>
            </div>
            <Camera className="w-8 h-8 text-primary-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unlocked</p>
              <p className="text-2xl font-bold text-green-600">{unlockedScenes.length}</p>
            </div>
            <Unlock className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locked</p>
              <p className="text-2xl font-bold text-gray-600">{lockedScenes.length}</p>
            </div>
            <Lock className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Unlocked Scenes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Scenes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockedScenes.map((scene, index) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Scene Preview */}
                <div className="h-48 bg-gradient-to-br from-primary-500 to-companion-purple flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-white opacity-50" />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{scene.name}</h3>
                    {scene.isFavorite && (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scene.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="info">{scene.environment}</Badge>
                    <Badge variant="default">{scene.timeOfDay}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Used {scene.timesUsed} times</span>
                    {scene.userRating > 0 && (
                      <span className="flex items-center">
                        <span className="mr-1">{scene.userRating}</span>
                        <span>★</span>
                      </span>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => activateScene(scene.id)}
                    className="w-full"
                    variant="primary"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Enter Scene
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Locked Scenes */}
      {lockedScenes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Locked Scenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedScenes.map((scene, index) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="opacity-60 hover:opacity-80 transition-opacity">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                      <Lock className="w-16 h-16 text-white opacity-50" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="error">Locked</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{scene.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{scene.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {scenes.length === 0 && !loading && (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No scenes available</p>
        </div>
      )}
    </div>
  )
}