// ============================================
// components/ConversationList.tsx
// Liste des conversations privées
// ============================================

'use client'

import { useState } from 'react'
import { GlassCard } from './ui/GlassCard'
import { Badge } from './ui/Badge'
import { formatDistanceToNow } from '@/lib/date'
import { MessageCircle } from 'lucide-react'
import type { ConversationWithMessages } from '@/app/actions/social'

interface ConversationListProps {
  conversations: ConversationWithMessages[]
  currentUserId: string
  selectedId?: string
  onSelect: (conversation: ConversationWithMessages) => void
}

export function ConversationList({ 
  conversations, 
  currentUserId, 
  selectedId, 
  onSelect 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <GlassCard className="h-64 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 text-white/30 mx-auto mb-2" />
          <p className="text-sm text-white/50">Aucune conversation</p>
          <p className="text-xs text-white/30">Les messages apparaîtront ici</p>
        </div>
      </GlassCard>
    )
  }
  
  return (
    <div className="space-y-2">
      {conversations.map(conv => {
        const otherParticipant = conv.participantA.id === currentUserId 
          ? conv.participantB 
          : conv.participantA
        
        const lastMessage = conv.messages[0]
        
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left p-3 rounded-xl transition-colors ${
              selectedId === conv.id 
                ? 'bg-violet-500/20 border border-violet-500/30' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <span className="text-violet-400 font-medium">
                    {(otherParticipant.displayName || otherParticipant.username).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">
                    {otherParticipant.displayName || otherParticipant.username}
                  </p>
                  {lastMessage && (
                    <p className="text-sm text-white/50 line-clamp-1">
                      {lastMessage.content.substring(0, 40)}
                      {lastMessage.content.length > 40 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                {lastMessage && (
                  <span className="text-xs text-white/30">
                    {formatDistanceToNow(new Date(lastMessage.createdAt))}
                  </span>
                )}
                {conv.unreadCount > 0 && (
                  <Badge variant="primary" className="text-xs">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
