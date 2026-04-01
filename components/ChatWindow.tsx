// ============================================
// components/ChatWindow.tsx
// Fenêtre de chat pour messages privés
// ============================================

'use client'

import { useState, useRef, useEffect } from 'react'
import { GlassCard } from './ui/GlassCard'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { ScrollArea } from './ui/ScrollArea'
import { sendMessage, markAsRead } from '@/app/actions/social'
import { formatDistanceToNow } from '@/lib/date'
import { Send, User } from 'lucide-react'
import type { Message } from '@prisma/client'

interface ChatWindowProps {
  conversationId: string
  otherUser: { id: string; username: string; displayName: string | null }
  currentUserId: string
  initialMessages: Message[]
}

export function ChatWindow({ 
  conversationId, 
  otherUser, 
  currentUserId, 
  initialMessages 
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Mark as read on mount
  useEffect(() => {
    markAsRead(currentUserId, conversationId)
  }, [currentUserId, conversationId])
  
  const handleSend = async () => {
    if (!newMessage.trim() || sending) return
    
    setSending(true)
    const result = await sendMessage(currentUserId, otherUser.id, newMessage)
    
    if (result.success) {
      setNewMessage('')
      // Refresh messages (in real app would use Supabase Realtime)
      // For now, optimistically add
      const tempMessage: Message = {
        id: Date.now().toString(),
        conversationId,
        senderId: currentUserId,
        receiverId: otherUser.id,
        content: newMessage.trim(),
        read: false,
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, tempMessage])
    }
    
    setSending(false)
  }
  
  return (
    <GlassCard className="h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <p className="font-medium text-white">
            {otherUser.displayName || otherUser.username}
          </p>
          <p className="text-xs text-white/40">@{otherUser.username}</p>
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId
            const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`px-4 py-2 rounded-2xl ${
                      isMe 
                        ? 'bg-violet-500 text-white rounded-br-md' 
                        : 'bg-white/10 text-white rounded-bl-md'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                  <p className={`text-xs text-white/30 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatDistanceToNow(new Date(msg.createdAt))}
                    {isMe && (
                      <span className="ml-2">{msg.read ? 'Lu' : 'Envoyé'}</span>
                    )}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez un message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            maxLength={2000}
          />
          <Button 
            onClick={handleSend} 
            disabled={sending || !newMessage.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-white/30 mt-2 text-right">
          {newMessage.length}/2000
        </p>
      </div>
    </GlassCard>
  )
}
