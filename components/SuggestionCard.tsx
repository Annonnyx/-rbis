// ============================================
// components/SuggestionCard.tsx
// Card de suggestion avec vote, statut et auteur
// @example <SuggestionCard suggestion={s} onVote={handleVote} hasVoted={false} />
// ============================================

import { cn } from '@/lib/utils'
import { Badge } from './ui/Badge'
import { ThumbsUp, User } from 'lucide-react'
import type { SuggestionWithAuthor } from '@/types'
import { SuggestionStatus } from '@prisma/client'

export interface SuggestionCardProps {
  suggestion: SuggestionWithAuthor
  onVote?: () => void
  hasVoted: boolean
  showDetailButton?: boolean
  onClick?: () => void
  className?: string
}

const statusVariants: Record<SuggestionStatus, 'neutral' | 'violet' | 'success' | 'warning'> = {
  PENDING: 'neutral',
  ACCEPTED: 'violet',
  IMPLEMENTED: 'success',
  REJECTED: 'warning',
}

const statusLabels: Record<SuggestionStatus, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  IMPLEMENTED: 'Implémentée',
  REJECTED: 'Refusée',
}

/**
 * Card complète de suggestion avec vote
 * Accessible : bouton vote avec aria-pressed
 */
export function SuggestionCard({ 
  suggestion, 
  onVote, 
  hasVoted,
  showDetailButton,
  onClick,
  className 
}: SuggestionCardProps) {
  const voteCount = suggestion._count?.votes ?? suggestion.votes?.length ?? 0
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        'backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5',
        'hover:bg-white/[0.08] transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-white leading-tight">{suggestion.title}</h3>
        <Badge variant={statusVariants[suggestion.status]}>
          {statusLabels[suggestion.status]}
        </Badge>
      </div>
      
      {/* Description */}
      <p className="text-sm text-white/60 line-clamp-2 mb-4">
        {suggestion.description}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Author */}
        <div className="flex items-center gap-2 text-sm text-white/40">
          <User className="w-4 h-4" />
          <span>{suggestion.author.displayName || suggestion.author.username}</span>
        </div>
        
        {/* Vote button */}
        {onVote && suggestion.status === 'PENDING' && (
          <button
            onClick={onVote}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'transition-all duration-200',
              hasVoted 
                ? 'bg-violet-500/20 text-violet-400' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            )}
            aria-pressed={hasVoted}
          >
            <ThumbsUp className={cn('w-4 h-4', hasVoted && 'fill-current')} />
            <span>{voteCount}</span>
          </button>
        )}
        
        {/* Vote count (read-only) or detail button */}
        {(!onVote || suggestion.status !== 'PENDING') && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-white/40">
              <ThumbsUp className="w-4 h-4" />
              <span>{voteCount}</span>
            </div>
            {showDetailButton && (
              <span className="text-xs text-violet-400">Voir détails →</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
