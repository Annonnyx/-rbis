// ============================================
// app/actions/city.ts
// Server Actions pour chat de ville et annonces
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'
import type { CityChat, CityAnnouncement } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface CityChatWithAuthor {
  id: string
  locationId: string
  authorId: string
  content: string
  createdAt: Date
  author: { id: string; username: string; displayName: string | null }
}

export interface CityAnnouncementWithAuthor {
  id: string
  locationId: string
  authorId: string
  title: string
  content: string
  pinned: boolean
  expiresAt: Date | null
  createdAt: Date
  author: { id: string; username: string; displayName: string | null }
}

// ============================================
// CHAT PUBLIC
// ============================================

/**
 * Envoie un message dans le chat de ville
 * Rate limit: max 1 message / 2 secondes
 */
export async function sendCityMessage(
  userId: string,
  locationId: string,
  content: string
): Promise<ActionResult<{ messageId: string }>> {
  try {
    // Validation
    const trimmedContent = content.trim()
    if (!trimmedContent || trimmedContent.length > 500) {
      return { success: false, error: 'Message invalide (max 500 caractères)' }
    }
    
    // Vérifier que l'utilisateur réside dans cette ville
    const userProfile = await prisma.gameProfile.findUnique({
      where: { userId },
      select: { homeLocationId: true },
    })
    
    if (!userProfile || userProfile.homeLocationId !== locationId) {
      return { success: false, error: 'Vous devez résider dans cette ville pour chatter' }
    }
    
    // Rate limit check
    const recentMessage = await prisma.cityChat.findFirst({
      where: {
        authorId: userId,
        createdAt: {
          gte: new Date(Date.now() - 2000),
        },
      },
    })
    
    if (recentMessage) {
      return { success: false, error: 'Veuillez attendre 2 secondes entre chaque message' }
    }
    
    const message = await prisma.cityChat.create({
      data: {
        locationId,
        authorId: userId,
        content: trimmedContent,
      },
    })
    
    return { success: true, data: { messageId: message.id } }
  } catch (error: any) {
    console.error('Send city message error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère les messages du chat de ville (pagination, 100 derniers)
 */
export async function getCityMessages(
  locationId: string,
  cursor?: string
): Promise<ActionResult<{ messages: CityChatWithAuthor[]; nextCursor?: string }>> {
  try {
    const messages = await prisma.cityChat.findMany({
      where: { locationId },
      include: {
        author: { select: { id: true, username: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })
    
    return { 
      success: true, 
      data: { 
        messages: messages.reverse(),
        nextCursor: messages.length === 100 ? messages[messages.length - 1]?.id : undefined,
      }
    }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

// ============================================
// ANNONCES
// ============================================

/**
 * Publie une annonce dans une ville (pour administrateurs futurs ou élus)
 */
export async function postAnnouncement(
  userId: string,
  locationId: string,
  data: { title: string; content: string; pinned?: boolean; expiresAt?: Date }
): Promise<ActionResult<{ announcementId: string }>> {
  try {
    // Validation
    const title = data.title.trim()
    const content = data.content.trim()
    
    if (!title || title.length > 100) {
      return { success: false, error: 'Titre invalide (max 100 caractères)' }
    }
    
    if (!content || content.length > 1000) {
      return { success: false, error: 'Contenu invalide (max 1000 caractères)' }
    }
    
    // Vérifier que l'utilisateur réside dans cette ville
    const userProfile = await prisma.gameProfile.findUnique({
      where: { userId },
      select: { homeLocationId: true },
    })
    
    if (!userProfile || userProfile.homeLocationId !== locationId) {
      return { success: false, error: 'Vous devez résider dans cette ville' }
    }
    
    const announcement = await prisma.cityAnnouncement.create({
      data: {
        locationId,
        authorId: userId,
        title,
        content,
        pinned: data.pinned || false,
        expiresAt: data.expiresAt,
      },
    })
    
    revalidatePath(`/city/${locationId}`)
    
    return { success: true, data: { announcementId: announcement.id } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Récupère les annonces d'une ville
 */
export async function getCityAnnouncements(
  locationId: string,
  includeExpired: boolean = false
): Promise<ActionResult<CityAnnouncementWithAuthor[]>> {
  try {
    const where: any = { locationId }
    
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ]
    }
    
    const announcements = await prisma.cityAnnouncement.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, displayName: true } },
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
    })
    
    return { success: true, data: announcements }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Supprime une annonce
 */
export async function deleteAnnouncement(
  userId: string,
  announcementId: string
): Promise<ActionResult> {
  try {
    const announcement = await prisma.cityAnnouncement.findUnique({
      where: { id: announcementId },
    })
    
    if (!announcement) {
      return { success: false, error: 'Annonce introuvable' }
    }
    
    // Seul l'auteur peut supprimer
    if (announcement.authorId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    await prisma.cityAnnouncement.delete({
      where: { id: announcementId },
    })
    
    revalidatePath(`/city/${announcement.locationId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// STATS VILLE
// ============================================

/**
 * Récupère les stats d'une ville
 */
export async function getCityStats(locationId: string): Promise<ActionResult<{
  residents: number
  companies: number
  recentMessages: number
}>> {
  try {
    const [residents, companies, recentMessages] = await Promise.all([
      prisma.gameProfile.count({ where: { homeLocationId: locationId } }),
      prisma.company.count({ where: { locationId } }),
      prisma.cityChat.count({
        where: {
          locationId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ])
    
    return { success: true, data: { residents, companies, recentMessages } }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
