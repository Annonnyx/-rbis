// ============================================
// app/messages/page.tsx
// Page messagerie privée
// ============================================

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { getConversations } from '@/app/actions/social'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { ConversationList } from '@/components/ConversationList'
import { ChatWindow } from '@/components/ChatWindow'
import { EmptyState } from '@/components/EmptyState'
import { MessageCircle } from 'lucide-react'

interface MessagesPageProps {
  searchParams: { conversation?: string }
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer les conversations
  const conversationsResult = await getConversations(user.id)
  const conversations = conversationsResult.success ? conversationsResult.data || [] : []
  
  // Trouver la conversation sélectionnée
  const selectedConversation = searchParams.conversation 
    ? conversations.find(c => c.id === searchParams.conversation)
    : null
  
  // Récupérer les messages si une conversation est sélectionnée
  let messages: any[] = []
  if (selectedConversation) {
    const { getMessages } = await import('@/app/actions/social')
    const messagesResult = await getMessages(user.id, selectedConversation.id)
    messages = messagesResult.success ? messagesResult.data || [] : []
  }
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Messagerie"
        description="Discutez en privé avec d'autres joueurs"
      />
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste des conversations */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-medium text-white/50 mb-3">Conversations</h2>
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
            selectedId={selectedConversation?.id}
            onSelect={() => {}} // Server-side, will be handled by URL change
          />
        </div>
        
        {/* Fenêtre de chat */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation.id}
              otherUser={
                selectedConversation.participantA.id === user.id
                  ? selectedConversation.participantB
                  : selectedConversation.participantA
              }
              currentUserId={user.id}
              initialMessages={messages}
            />
          ) : (
            <GlassCard className="h-[500px] flex items-center justify-center">
              <EmptyState
                icon={MessageCircle}
                title="Sélectionnez une conversation"
                description="Choisissez une conversation pour commencer à discuter"
              />
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
