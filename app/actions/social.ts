// ============================================
// app/actions/social.ts
// Server Actions pour messagerie privée
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'
import type { Message, Conversation } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface ConversationWithMessages extends Conversation {
  participantA: { id: string; username: string; displayName: string | null }
  participantB: { id: string; username: string; displayName: string | null }
  messages: Message[]
  unreadCount: number
}

// ============================================
// ENVOI DE MESSAGES
// ============================================

/**
 * Normalise l'ordre des participants (alphabétique)
 */
function normalizeParticipants(userId1: string, userId2: string): [string, string] {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]
}

/**
 * Envoie un message privé
 * Rate limit: max 1 message / 2 secondes par utilisateur
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<ActionResult<{ messageId: string }>> {
  try {
    // Validation
    if (senderId === receiverId) {
      return { success: false, error: 'Vous ne pouvez pas vous écrire à vous-même' }
    }
    
    const trimmedContent = content.trim()
    if (!trimmedContent || trimmedContent.length > 2000) {
      return { success: false, error: 'Message invalide (max 2000 caractères)' }
    }
    
    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    })
    
    if (!receiver) {
      return { success: false, error: 'Destinataire introuvable' }
    }
    
    // Rate limit check: dernier message dans les 2 secondes
    const recentMessage = await prisma.message.findFirst({
      where: {
        senderId,
        createdAt: {
          gte: new Date(Date.now() - 2000),
        },
      },
    })
    
    if (recentMessage) {
      return { success: false, error: 'Veuillez attendre 2 secondes entre chaque message' }
    }
    
    // Normaliser l'ordre des participants
    const [participantAId, participantBId] = normalizeParticipants(senderId, receiverId)
    
    // Créer ou retrouver la conversation
    const conversation = await prisma.conversation.upsert({
      where: {
        participantAId_participantBId: {
          participantAId,
          participantBId,
        },
      },
      update: {
        lastMessageAt: new Date(),
      },
      create: {
        participantAId,
        participantBId,
        lastMessageAt: new Date(),
      },
    })
    
    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        content: trimmedContent,
        read: false,
      },
    })
    
    return { success: true, data: { messageId: message.id } }
  } catch (error: any) {
    console.error('Send message error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// RÉCUPÉRATION
// ============================================

/**
 * Récupère les conversations d'un utilisateur
 */
export async function getConversations(userId: string): Promise<ActionResult<ConversationWithMessages[]>> {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participantAId: userId },
          { participantBId: userId },
        ],
      },
      include: {
        participantA: { select: { id: true, username: true, displayName: true } },
        participantB: { select: { id: true, username: true, displayName: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })
    
    // Compter les non-lus pour chaque conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            read: false,
          },
        })
        return { ...conv, unreadCount }
      })
    )
    
    return { success: true, data: conversationsWithUnread }
  } catch (error) {
    console.error('Get conversations error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère les messages d'une conversation avec pagination
 */
export async function getMessages(
  userId: string,
  conversationId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<ActionResult<Message[]>> {
  try {
    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })
    
    if (!conversation || (conversation.participantAId !== userId && conversation.participantBId !== userId)) {
      return { success: false, error: 'Non autorisé' }
    }
    
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
    
    return { success: true, data: messages.reverse() }
  } catch (error) {
    console.error('Get messages error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Marque les messages comme lus
 */
export async function markAsRead(
  userId: string,
  conversationId: string
): Promise<ActionResult> {
  try {
    // Vérifier autorisation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })
    
    if (!conversation || (conversation.participantAId !== userId && conversation.participantBId !== userId)) {
      return { success: false, error: 'Non autorisé' }
    }
    
    // Marquer comme lus tous les messages reçus
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    })
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Compte les messages non-lus totaux
 */
export async function countUnreadMessages(userId: string): Promise<number> {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    })
    return count
  } catch (error) {
    return 0
  }
}

// ============================================
// SUPPRESSION (non disponible - immutabilité)
// ============================================

// Note: Les messages ne peuvent pas être supprimés par design
// Les conversations sont immutables pour l'historique
