import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Search, Plus, Filter, Calendar, Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { useCompanionStore } from '@/store/companionStore'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Memory {
  id: string
  content: string
  type: string
  importance: number
  isCore: boolean
  tags: string[]
  createdAt: string
  lastAccessed: string
}

const memoryTypes = [
  'conversation', 'event', 'preference', 'milestone', 'emotion',
  'discovery', 'shared_experience', 'secret', 'dream', 'achievement'
]

const importanceLabels = {
  1: 'Trivial',
  2: 'Minor',
  3: 'Notable',
  4: 'Significant',
  5: 'Important',
  6: 'Very Important',
  7: 'Crucial',
  8: 'Major',
  9: 'Critical',
  10: 'Essential'
}

export default function MemoriesPage() {
  const { user } = useAuthStore()
  const { activeCompanion } = useCompanionStore()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchMemories = async () => {
    if (!activeCompanion) return
    
    setLoading(true)
    try {
      const response = await api.get(`/memory/${activeCompanion.id}`)
      setMemories(response.data)
    } catch (error) {
      toast.error('Failed to load memories')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchMemories()
  }, [activeCompanion])

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = !filterType || memory.type === filterType
    return matchesSearch && matchesType
  })

  const coreMemories = filteredMemories.filter(m => m.isCore)
  const regularMemories = filteredMemories.filter(m => !m.isCore)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Memory System</h1>
        <p className="text-gray-600 mt-2">Shared experiences and important moments</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            {memoryTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Memory
          </Button>
        </div>
      </Card>

      {/* Core Memories */}
      {coreMemories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Core Memories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreMemories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-red-200 bg-red-50/50">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="error">Core Memory</Badge>
                    <Badge variant={memory.importance >= 8 ? 'error' : 'default'}>
                      {importanceLabels[memory.importance as keyof typeof importanceLabels]}
                    </Badge>
                  </div>
                  <p className="text-gray-900 mb-3">{memory.content}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {memory.tags.map((tag, idx) => (
                      <Badge key={idx} variant="info" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(memory.createdAt)}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Memories */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Memories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularMemories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="info">{memory.type}</Badge>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ml-1 ${
                          i < Math.ceil(memory.importance / 2) ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">{memory.content}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {memory.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(memory.createdAt)}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {filteredMemories.length === 0 && !loading && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No memories found</p>
        </div>
      )}
    </div>
  )
}