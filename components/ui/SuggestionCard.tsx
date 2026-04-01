'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { ThumbsUp, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { GlassCard } from '../GlassCard'

type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED'

interface SuggestionCardProps {
  suggestion: {
    id: string
    title: string
    description: string
    status: SuggestionStatus
    upvotes: number
    createdAt: Date
    author: {
      username: string
      displayName?: string | null
    }
    hasVoted?: boolean
  }
  onVote?: (suggestionId: string) => void
}

const statusConfig: Record<SuggestionStatus, { label: string; icon: typeof Clock; color: string }> = {
  PENDING: {
    label: 'En attente',
    icon: Clock,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  },
  ACCEPTED: {
    label: 'Acceptée',
    icon: CheckCircle,
    color: 'text-green-400 bg-green-400/10 border-green-400/20',
  },
  REJECTED: {
    label: 'Rejetée',
    icon: XCircle,
    color: 'text-red-400 bg-red-400/10 border-red-400/20',
  },
  IMPLEMENTED: {
    label: 'Implémentée',
    icon: Sparkles,
    color: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  },
}

export function SuggestionCard({ suggestion, onVote }: SuggestionCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const status = statusConfig[suggestion.status]
  const StatusIcon = status.icon

  const handleVote = async () => {
    if (!onVote || suggestion.hasVoted || isVoting) return
    setIsVoting(true)
    await onVote(suggestion.id)
    setIsVoting(false)
  }

  return (
    <GlassCard className="transition-all duration-200 hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                status.color
              )}
            >
              <StatusIcon size={12} />
              {status.label}
            </span>
            <span className="text-xs text-white/40">
              par {suggestion.author.displayName || suggestion.author.username}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{suggestion.title}</h3>
          <p className="text-sm text-white/60 line-clamp-3">{suggestion.description}</p>
        </div>
        {onVote && (
          <button
            onClick={handleVote}
            disabled={suggestion.hasVoted || isVoting}
            className={clsx(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-200',
              suggestion.hasVoted
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
            )}
          >
            <ThumbsUp size={18} className={suggestion.hasVoted ? 'fill-current' : ''} />
            <span className="text-xs font-medium">{suggestion.upvotes}</span>
          </button>
        )}
        {!onVote && (
          <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60">
            <ThumbsUp size={18} />
            <span className="text-xs font-medium">{suggestion.upvotes}</span>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
