'use client'

import { useEffect, useState } from 'react'
import { getAllSuggestionsForAdmin, updateSuggestionStatus } from '@/app/actions/admin'
import { getCurrentUser } from '@/app/actions/auth'
import { GlassCard } from '@/components/GlassCard'
import { Clock, CheckCircle, XCircle, Sparkles, ThumbsUp } from 'lucide-react'

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', icon: Clock, color: 'text-yellow-400' },
  ACCEPTED: { label: 'Acceptée', icon: CheckCircle, color: 'text-green-400' },
  REJECTED: { label: 'Rejetée', icon: XCircle, color: 'text-red-400' },
  IMPLEMENTED: { label: 'Implémentée', icon: Sparkles, color: 'text-violet-400' },
}

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser()
      if (user) {
        setUserId(user.id)
        await loadSuggestions()
      }
    }
    init()
  }, [])

  async function loadSuggestions() {
    const result = await getAllSuggestionsForAdmin()
    if (result.suggestions) {
      setSuggestions(result.suggestions)
    }
    setLoading(false)
  }

  async function handleStatusChange(suggestionId: string, newStatus: 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED') {
    setUpdating(suggestionId)
    const result = await updateSuggestionStatus(userId, suggestionId, newStatus)
    if (!result.error) {
      await loadSuggestions()
    }
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/50">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Modération des suggestions</h1>

      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const StatusIcon = STATUS_CONFIG[suggestion.status as keyof typeof STATUS_CONFIG].icon
          const statusColor = STATUS_CONFIG[suggestion.status as keyof typeof STATUS_CONFIG].color
          const statusLabel = STATUS_CONFIG[suggestion.status as keyof typeof STATUS_CONFIG].label

          return (
            <GlassCard key={suggestion.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon size={16} className={statusColor} />
                    <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-sm text-white/50">
                      {suggestion.upvotes} votes
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-sm text-white/50">
                      par {suggestion.author.displayName || suggestion.author.username}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{suggestion.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{suggestion.description}</p>

                  {suggestion.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(suggestion.id, 'ACCEPTED')}
                        disabled={updating === suggestion.id}
                        className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium transition-all"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleStatusChange(suggestion.id, 'REJECTED')}
                        disabled={updating === suggestion.id}
                        className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-all"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}

                  {suggestion.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStatusChange(suggestion.id, 'IMPLEMENTED')}
                      disabled={updating === suggestion.id}
                      className="px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <Sparkles size={16} />
                      Marquer comme implémentée
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          )
        })}

        {suggestions.length === 0 && (
          <GlassCard className="text-center py-12">
            <p className="text-white/50">Aucune suggestion pour le moment</p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
