// ============================================
// app/actions/suggestions.ts
// Server Actions pour le système de suggestions
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { ActionResult, SuggestionFormData } from '@/types'
import type { SuggestionStatus } from '@prisma/client'

/**
 * Crée une nouvelle suggestion
 */
export async function createSuggestion(
  userId: string,
  data: SuggestionFormData
): Promise<ActionResult<{ suggestionId: string }>> {
  try {
    // Validation basique
    if (!data.title.trim() || data.title.length > 100) {
      return { success: false, error: 'Titre invalide (max 100 caractères)' }
    }
    
    if (!data.description.trim() || data.description.length > 2000) {
      return { success: false, error: 'Description invalide (max 2000 caractères)' }
    }
    
    const suggestion = await prisma.suggestion.create({
      data: {
        authorId: userId,
        title: data.title.trim(),
        description: data.description.trim(),
        status: 'PENDING',
      },
    })
    
    revalidatePath('/suggestions')
    
    return { success: true, data: { suggestionId: suggestion.id } }
  } catch (error) {
    console.error('Create suggestion error:', error)
    return { success: false, error: 'Erreur lors de la création' }
  }
}

/**
 * Récupère toutes les suggestions avec pagination
 */
export async function getSuggestions(
  status?: SuggestionStatus,
  page: number = 1,
  limit: number = 20
) {
  try {
    const skip = (page - 1) * limit
    
    const [suggestions, total] = await Promise.all([
      prisma.suggestion.findMany({
        where: status ? { status } : undefined,
        include: {
          author: {
            select: { id: true, username: true, displayName: true },
          },
          _count: { select: { votes: true } },
        },
        orderBy: [
          { status: 'asc' }, // PENDING first
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.suggestion.count({
        where: status ? { status } : undefined,
      }),
    ])
    
    return {
      success: true,
      suggestions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Get suggestions error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Vote pour une suggestion
 */
export async function voteSuggestion(
  userId: string,
  suggestionId: string
): Promise<ActionResult<{ hasVoted: boolean; voteCount: number }>> {
  try {
    // Vérifier si déjà voté
    const existingVote = await prisma.suggestionVote.findFirst({
      where: { userId, suggestionId },
    })
    
    if (existingVote) {
      // Annuler le vote
      await prisma.suggestionVote.delete({
        where: { id: existingVote.id },
      })
      
      const count = await prisma.suggestionVote.count({
        where: { suggestionId },
      })
      
      revalidatePath('/suggestions')
      return { success: true, data: { hasVoted: false, voteCount: count } }
    }
    
    // Créer le vote
    await prisma.suggestionVote.create({
      data: { userId, suggestionId },
    })
    
    const count = await prisma.suggestionVote.count({
      where: { suggestionId },
    })
    
    revalidatePath('/suggestions')
    return { success: true, data: { hasVoted: true, voteCount: count } }
  } catch (error) {
    console.error('Vote error:', error)
    return { success: false, error: 'Erreur lors du vote' }
  }
}

/**
 * Vérifie si l'utilisateur a voté pour une suggestion
 */
export async function checkUserVote(userId: string, suggestionId: string) {
  try {
    const vote = await prisma.suggestionVote.findFirst({
      where: { userId, suggestionId },
    })
    return { success: true, hasVoted: !!vote }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère les suggestions de l'utilisateur
 */
export async function getUserSuggestions(userId: string) {
  try {
    const suggestions = await prisma.suggestion.findMany({
      where: { authorId: userId },
      include: {
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return { success: true, suggestions }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

// ============================================
// ADMIN ACTIONS
// ============================================

/**
 * Met à jour le statut d'une suggestion (admin uniquement)
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  status: SuggestionStatus,
  adminUserId: string
): Promise<ActionResult> {
  try {
    // Vérifier si l'utilisateur est admin (à implémenter selon votre logique)
    // Pour l'instant, on vérifie juste si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
    })
    
    if (!user) {
      return { success: false, error: 'Non autorisé' }
    }
    
    await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status },
    })
    
    revalidatePath('/suggestions')
    revalidatePath('/admin/suggestions')
    
    return { success: true }
  } catch (error) {
    console.error('Update status error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère toutes les suggestions pour l'admin
 */
export async function getAllSuggestionsForAdmin(adminUserId: string) {
  try {
    // Vérification admin simplifiée
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
    })
    
    if (!user) {
      return { success: false, error: 'Non autorisé' }
    }
    
    const suggestions = await prisma.suggestion.findMany({
      include: {
        author: {
          select: { username: true, displayName: true },
        },
        _count: { select: { votes: true } },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    })
    
    return { success: true, suggestions }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Supprime une suggestion (admin ou auteur uniquement)
 */
export async function deleteSuggestion(
  suggestionId: string,
  userId: string
): Promise<ActionResult> {
  try {
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
      select: { authorId: true },
    })
    
    if (!suggestion) {
      return { success: false, error: 'Suggestion introuvable' }
    }
    
    // Vérifier si auteur ou admin
    if (suggestion.authorId !== userId) {
      // Ici, vérifier si admin
      return { success: false, error: 'Non autorisé' }
    }
    
    await prisma.suggestion.delete({
      where: { id: suggestionId },
    })
    
    revalidatePath('/suggestions')
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
