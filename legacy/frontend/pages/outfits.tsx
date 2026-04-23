import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, Tshirt, Sparkles, Lock, Unlock, Star, Filter, Sun } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useCompanionStore } from '@/store/companionStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Outfit {
  id: string
  name: string
  category: string
  description: string
  colors: string[]
  moodEffects: any
  unlockTokens: number
  unlockBond: number
  isUnlocked: boolean
  isFavorite: boolean
  isCurrentOutfit: boolean
  previewImage?: string
}

const outfitCategories = [
  { id: 'all', name: 'All Outfits', icon: Tshirt },
  { id: 'casual', name: 'Casual', icon: Tshirt },
  { id: 'formal', name: 'Formal', icon: Star },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles },
  { id: 'seasonal', name: 'Seasonal', icon: Palette },
]

export default function OutfitsPage() {
  const { user } = useAuthStore()
  const { activeCompanion } = useCompanionStore()
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [recommendations, setRecommendations] = useState<Outfit[]>([])

  const fetchOutfits = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/outfits/${activeCompanion?.id}`)
      setOutfits(response.data)
      const current = response.data.find((o: Outfit) => o.isCurrentOutfit)
      setCurrentOutfit(current || null)
    } catch (error) {
      toast.error('Failed to load outfits')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await api.get(`/outfits/${activeCompanion?.id}/recommendations`)
      setRecommendations(response.data)
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    }
  }

  useEffect(() => {
    if (activeCompanion) {
      fetchOutfits()
      fetchRecommendations()
    }
  }, [activeCompanion])

  const activateOutfit = async (outfitId: string) => {
    if (!activeCompanion) return
    
    try {
      await api.post(`/outfit/activate`, {
        characterId: activeCompanion.id,
        outfitId
      })
      toast.success('Outfit activated!')
      fetchOutfits()
    } catch (error) {
      toast.error('Failed to activate outfit')
    }
  }

  const unlockOutfit = async (outfitId: string) => {
    if (!activeCompanion) return
    
    try {
      await api.post(`/outfit/unlock`, {
        characterId: activeCompanion.id,
        outfitId
      })
      toast.success('Outfit unlocked!')
      fetchOutfits()
    } catch (error) {
      toast.error('Failed to unlock outfit')
    }
  }

  const filteredOutfits = outfits.filter(outfit => {
    if (activeCategory === 'all') return true
    return outfit.category === activeCategory
  })

  const unlockedOutfits = filteredOutfits.filter(o => o.isUnlocked)
  const lockedOutfits = filteredOutfits.filter(o => !o.isUnlocked)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wardrobe</h1>
        <p className="text-gray-600 mt-2">Dress your companion in different styles and outfits</p>
      </div>

      {/* Current Outfit Display */}
      {currentOutfit && (
        <Card className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Current Outfit</h3>
              <p className="text-gray-600 mt-1">{currentOutfit.name}</p>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant="info">{currentOutfit.category}</Badge>
                {currentOutfit.moodEffects?.mood && (
                  <Badge variant="default">{currentOutfit.moodEffects.mood}</Badge>
                )}
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="mb-8 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
              Recommended for You
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((outfit) => (
              <Card 
                key={outfit.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => outfit.isUnlocked && activateOutfit(outfit.id)}
              >
                <div className="h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-t-lg flex items-center justify-center">
                  <Tshirt className="w-8 h-8 text-white opacity-75" />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{outfit.name}</h4>
                  <Badge variant="info" className="mt-2 text-xs">{outfit.category}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {outfitCategories.map((category) => (
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
              <p className="text-sm font-medium text-gray-600">Total Outfits</p>
              <p className="text-2xl font-bold text-gray-900">{outfits.length}</p>
            </div>
            <Tshirt className="w-8 h-8 text-primary-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unlocked</p>
              <p className="text-2xl font-bold text-green-600">{unlockedOutfits.length}</p>
            </div>
            <Unlock className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locked</p>
              <p className="text-2xl font-bold text-gray-600">{lockedOutfits.length}</p>
            </div>
            <Lock className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Unlocked Outfits */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Outfits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockedOutfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`hover:shadow-xl transition-all duration-300 ${
                  outfit.isCurrentOutfit ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {/* Outfit Preview */}
                <div className="h-48 bg-gradient-to-br from-companion-pink to-companion-purple flex items-center justify-center">
                  <Tshirt className="w-16 h-16 text-white opacity-50" />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{outfit.name}</h3>
                    {outfit.isCurrentOutfit && (
                      <Badge variant="success">Active</Badge>
                    )}
                    {outfit.isFavorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <Badge variant="info" className="mb-2">{outfit.category}</Badge>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{outfit.description}</p>
                  
                  {/* Colors */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs text-gray-500">Colors:</span>
                    <div className="flex space-x-1">
                      {outfit.colors.slice(0, 4).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => activateOutfit(outfit.id)}
                    className="w-full"
                    variant={outfit.isCurrentOutfit ? "secondary" : "primary"}
                    disabled={outfit.isCurrentOutfit}
                  >
                    {outfit.isCurrentOutfit ? 'Currently Wearing' : 'Wear Outfit'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Locked Outfits */}
      {lockedOutfits.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Locked Outfits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedOutfits.map((outfit, index) => (
              <motion.div
                key={outfit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="opacity-70 hover:opacity-90 transition-opacity">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                      <Lock className="w-16 h-16 text-white opacity-50" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="error">Locked</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{outfit.name}</h3>
                    <Badge variant="info" className="mb-2">{outfit.category}</Badge>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{outfit.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                        {outfit.unlockTokens} tokens
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-pink-500" />
                        Bond {outfit.unlockBond}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => unlockOutfit(outfit.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Unlock Outfit
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {outfits.length === 0 && !loading && (
        <div className="text-center py-12">
          <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No outfits available</p>
        </div>
      )}
    </div>
  )
}