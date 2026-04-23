import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Volume2, Play, Pause, Settings, Sliders } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useCompanionStore } from '@/store/companionStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface VoicePreset {
  id: string
  name: string
  description: string
  basePitch: number
  baseSpeed: number
  baseTone: string
  baseBreathiness: number
  personalityMatch: string[]
}

interface VoiceParameters {
  pitch: number
  speed: number
  tone: string
  breathiness: number
  emotionalState: string
}

const toneOptions = ['warm', 'cool', 'neutral', 'soft', 'bold']
const emotionalStates = ['happy', 'sad', 'excited', 'calm', 'confident', 'shy']

export default function VoicePage() {
  const { user } = useAuthStore()
  const { activeCompanion } = useCompanionStore()
  const [voicePresets, setVoicePresets] = useState<VoicePreset[]>([])
  const [selectedPreset, setSelectedPreset] = useState<VoicePreset | null>(null)
  const [customParameters, setCustomParameters] = useState<VoiceParameters>({
    pitch: 1.0,
    speed: 1.0,
    tone: 'warm',
    breathiness: 0.2,
    emotionalState: 'calm'
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchVoicePresets = async () => {
    setLoading(true)
    try {
      const response = await api.get('/voice/presets')
      setVoicePresets(response.data)
      if (response.data.length > 0) {
        setSelectedPreset(response.data[0])
      }
    } catch (error) {
      toast.error('Failed to load voice presets')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchVoicePresets()
  }, [])

  const handlePresetSelect = (preset: VoicePreset) => {
    setSelectedPreset(preset)
    setCustomParameters({
      pitch: preset.basePitch,
      speed: preset.baseSpeed,
      tone: preset.baseTone,
      breathiness: preset.baseBreathiness,
      emotionalState: 'calm'
    })
  }

  const generateVoice = async () => {
    if (!activeCompanion) return
    
    try {
      setIsPlaying(true)
      const response = await api.post('/voice/generate', {
        characterId: activeCompanion.id,
        parameters: customParameters
      })
      
      // In a real implementation, this would play the audio
      toast.success('Voice generated successfully!')
      
      // Simulate playing duration
      setTimeout(() => {
        setIsPlaying(false)
      }, 3000)
    } catch (error) {
      toast.error('Failed to generate voice')
      setIsPlaying(false)
    }
  }

  const saveVoiceSettings = async () => {
    if (!activeCompanion || !selectedPreset) return
    
    try {
      await api.post('/voice/assign', {
        characterId: activeCompanion.id,
        presetId: selectedPreset.id,
        customParameters
      })
      toast.success('Voice settings saved!')
    } catch (error) {
      toast.error('Failed to save voice settings')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Voice Studio</h1>
        <p className="text-gray-600 mt-2">Customize your companion's voice and speech patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Voice Presets */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Presets</h2>
          <div className="space-y-4">
            {voicePresets.map((preset, index) => (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedPreset?.id === preset.id
                      ? 'border-2 border-primary-500 bg-primary-50'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <Volume2 className="w-5 h-5 mr-2 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                    </div>
                    {selectedPreset?.id === preset.id && (
                      <Badge variant="success">Selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {preset.personalityMatch.slice(0, 3).map((trait, idx) => (
                      <Badge key={idx} variant="info" className="text-xs">{trait}</Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Voice Customization */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Parameters</h2>
          
          {selectedPreset && (
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPreset.name}</h3>
                  <p className="text-sm text-gray-600">Customize this preset</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={generateVoice} disabled={isPlaying}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Playing...' : 'Preview'}
                  </Button>
                  <Button size="sm" onClick={saveVoiceSettings}>
                    Save Settings
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Pitch */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Pitch</label>
                    <span className="text-sm text-gray-600">{customParameters.pitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={customParameters.pitch}
                    onChange={(e) => setCustomParameters(prev => ({
                      ...prev,
                      pitch: parseFloat(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Speed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Speed</label>
                    <span className="text-sm text-gray-600">{customParameters.speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={customParameters.speed}
                    onChange={(e) => setCustomParameters(prev => ({
                      ...prev,
                      speed: parseFloat(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Tone</label>
                  <div className="grid grid-cols-5 gap-2">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setCustomParameters(prev => ({
                          ...prev,
                          tone
                        }))}
                        className={`p-2 text-xs rounded-lg border-2 transition-all ${
                          customParameters.tone === tone
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Breathiness */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Breathiness</label>
                    <span className="text-sm text-gray-600">{Math.round(customParameters.breathiness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={customParameters.breathiness}
                    onChange={(e) => setCustomParameters(prev => ({
                      ...prev,
                      breathiness: parseFloat(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                {/* Emotional State */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Emotional Modulation</label>
                  <select
                    value={customParameters.emotionalState}
                    onChange={(e) => setCustomParameters(prev => ({
                      ...prev,
                      emotionalState: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {emotionalStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )}

          {!selectedPreset && (
            <Card className="text-center py-12">
              <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a voice preset to begin customization</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}