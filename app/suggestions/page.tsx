'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/app/actions/auth'
import { getSuggestionsWithVotes, submitSuggestion, voteSuggestion } from '@/app/actions/suggestions'
import { GlassCard } from '@/components/GlassCard'
import { SuggestionCard } from '@/components/ui/SuggestionCard'
import { Plus, Filter } from 'lucide-react'

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'ACCEPTED', label: 'Acceptées' },
  { value: 'IMPLEMENTED', label: 'Implémentées' },
  { value: 'REJECTED', label: 'Rejetées' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'votes', label: 'Plus votées' },
]

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('recent')
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newSuggestion, setNewSuggestion] = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser()
      if (user) {
        setUserId(user.id)
        await loadSuggestions(user.id)
      }
    }

    init()
  }, [statusFilter, sortBy])

  async function loadSuggestions(uid: string) {
    setLoading(true)
    const result = await getSuggestionsWithVotes(uid, statusFilter, sortBy)
    if (result.suggestions) {
      setSuggestions(result.suggestions)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setSubmitting(true)
    const result = await submitSuggestion(userId, newSuggestion.title, newSuggestion.description)

    if (!result.error) {
      setShowNewModal(false)
      setNewSuggestion({ title: '', description: '' })
      await loadSuggestions(userId)
    }
    setSubmitting(false)
  }

  async function handleVote(suggestionId: string) {
    if (!userId) return

    const result = await voteSuggestion(userId, suggestionId)
    if (!result.error) {
      await loadSuggestions(userId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Suggestions</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all duration-200"
        >
          <Plus size={18} />
          Nouvelle suggestion
        </button>
      </div>

      {/* Filters */}
      <GlassCard padding="sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-white/50" />
            <span className="text-sm text-white/50">Statut:</span>
            <div className="flex gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                    statusFilter === filter.value
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">Trier:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'votes')}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-violet-500/50 focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Suggestions List */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-white/50">Chargement...</p>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onVote={handleVote}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-12">
          <p className="text-white/50">
            Aucune suggestion {statusFilter !== 'ALL' && 'avec ce filtre'}
          </p>
        </GlassCard>
      )}

      {/* New Suggestion Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard padding="lg" className="w-full max-w-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Nouvelle suggestion</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={newSuggestion.title}
                  onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                  placeholder="Une idée pour améliorer Ørbis..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description détaillée
                </label>
                <textarea
                  value={newSuggestion.description}
                  onChange={(e) => setNewSuggestion({ ...newSuggestion, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 resize-none"
                  placeholder="Expliquez votre idée en détail..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold transition-all duration-200"
                >
                  {submitting ? 'Envoi...' : 'Soumettre'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
