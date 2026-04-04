// ============================================
// components/SuggestionDetailModal.tsx
// Modal pour afficher le détail d'une suggestion
// ============================================

'use client'

import { useState } from 'react'
import { Modal } from './ui/Modal'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { ThumbsUp, X, User, Calendar } from 'lucide-react'
import { voteSuggestion } from '@/app/actions/suggestions'
import type { SuggestionWithAuthor } from '@/types'
import type { SuggestionStatus } from '@prisma/client'

interface SuggestionDetailModalProps {
  suggestion: SuggestionWithAuthor | null
  isOpen: boolean
  onClose: () => void
  hasVoted: boolean
  onVote: () => void
}

const statusConfig: Record<SuggestionStatus, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  ACCEPTED: { label: 'Acceptée', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  IMPLEMENTED: { label: 'Implémentée', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  REJECTED: { label: 'Refusée', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

export function SuggestionDetailModal({
  suggestion,
  isOpen,
  onClose,
  hasVoted: initialHasVoted,
  onVote,
}: SuggestionDetailModalProps) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [voteCount, setVoteCount] = useState(suggestion?._count?.votes || 0)
  const [loading, setLoading] = useState(false)
  
  if (!suggestion) return null
  
  async function handleVote() {
    if (loading || !suggestion) return
    setLoading(true)
    
    // Optimistic update
    const newHasVoted = !hasVoted
    const newCount = newHasVoted ? voteCount + 1 : voteCount - 1
    setHasVoted(newHasVoted)
    setVoteCount(newCount)
    
    try {
      const result = await voteSuggestion('', suggestion.id)
      if (result.success && result.data) {
        setHasVoted(result.data.hasVoted)
        setVoteCount(result.data.voteCount)
        onVote()
      }
    } catch (error) {
      // Rollback on error
      setHasVoted(hasVoted)
      setVoteCount(voteCount)
    } finally {
      setLoading(false)
    }
  }
  
  const status = statusConfig[suggestion.status]
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={suggestion.title}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Badge 
            variant="neutral" 
            className={`${status.color} border`}
          >
            {status.label}
          </Badge>
          
          {suggestion.status === 'PENDING' && (
            <button
              onClick={handleVote}
              disabled={loading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                ${hasVoted 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
              <span>{voteCount}</span>
            </button>
          )}
        </div>
        
        {/* Description */}
        <div className="prose prose-invert max-w-none">
          <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
            {suggestion.description}
          </p>
        </div>
        
        {/* Author info */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="font-medium text-white">
              {suggestion.author.displayName || suggestion.author.username}
            </p>
            <p className="text-sm text-white/40 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(suggestion.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-white">{voteCount}</p>
            <p className="text-xs text-white/50">votes</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-white">
              {Math.ceil((Date.now() - new Date(suggestion.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-xs text-white/50">jours</p>
          </div>
        </div>
        
        <Button onClick={onClose} variant="secondary" className="w-full">
          <X className="w-4 h-4 mr-1" />
          Fermer
        </Button>
      </div>
    </Modal>
  )
}
