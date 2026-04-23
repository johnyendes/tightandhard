import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, User, Heart, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useCompanionStore } from '@/store/companionStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const personalityTraits = [
  'Caring', 'Playful', 'Intelligent', 'Adventurous', 'Calm', 'Energetic',
  'Romantic', 'Humorous', 'Mysterious', 'Loyal', 'Creative', 'Confident'
]

const appearanceOptions = {
  hairColor: ['Blonde', 'Brunette', 'Black', 'Red', 'Silver', 'Pink', 'Blue'],
  eyeColor: ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Violet'],
  skinTone: ['Fair', 'Medium', 'Olive', 'Dark', 'Tan'],
  bodyType: ['Petite', 'Athletic', 'Curvy', 'Tall', 'Average']
}

export default function BuilderPage() {
  const { user } = useAuthStore()
  const { createCompanion, activeCompanion } = useCompanionStore()
  const [activeTab, setActiveTab] = useState<'basic' | 'personality' | 'appearance'>('basic')
  const [companionData, setCompanionData] = useState({
    name: '',
    personality: [] as string[],
    appearance: {},
    preferences: {}
  })

  const handleSave = async () => {
    if (!companionData.name) {
      toast.error('Please enter a name for your companion')
      return
    }

    const success = await createCompanion(companionData)
    if (success) {
      toast.success('Companion created successfully!')
    }
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: User },
    { id: 'personality', name: 'Personality', icon: Heart },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Companion Builder</h1>
        <p className="text-gray-600 mt-2">Create and customize your AI companion</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Companion Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-companion-pink to-companion-purple rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {companionData.name || 'Your Companion'}
              </h3>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {companionData.personality.slice(0, 3).map((trait, index) => (
                  <Badge key={index} variant="info">{trait}</Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Builder Interface */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'basic' && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Companion Name"
                    value={companionData.name}
                    onChange={(e) => setCompanionData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a name for your companion"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Companion Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Romantic Partner', 'Best Friend', 'Mentor', 'Adventure Buddy'].map((type) => (
                        <button
                          key={type}
                          className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                        >
                          <div className="font-medium text-gray-900">{type}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'personality' && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personality Traits</h3>
                <p className="text-gray-600 mb-6">Select traits that describe your companion's personality</p>
                
                <div className="grid grid-cols-3 gap-3">
                  {personalityTraits.map((trait) => {
                    const isSelected = companionData.personality.includes(trait)
                    return (
                      <button
                        key={trait}
                        onClick={() => {
                          setCompanionData(prev => ({
                            ...prev,
                            personality: isSelected
                              ? prev.personality.filter(t => t !== trait)
                              : [...prev.personality, trait]
                          }))
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {trait}
                      </button>
                    )
                  })}
                </div>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
                
                <div className="space-y-6">
                  {Object.entries(appearanceOptions).map(([category, options]) => (
                    <div key={category}>
                      <label className="text-sm font-medium text-gray-700 mb-3 block capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {options.map((option) => {
                          const isSelected = companionData.appearance[category] === option
                          return (
                            <button
                              key={option}
                              onClick={() => {
                                setCompanionData(prev => ({
                                  ...prev,
                                  appearance: { ...prev.appearance, [category]: option }
                                }))
                              }}
                              className={`p-2 text-sm rounded-md border transition-all ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} size="lg">
              {activeCompanion ? 'Update Companion' : 'Create Companion'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}