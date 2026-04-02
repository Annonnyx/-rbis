// ============================================
// app/actions/profile.ts
// Server Actions pour la gestion du profil
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

/**
 * Met à jour le displayName de l'utilisateur
 * Vérifie que displayNameChanged est false avant de permettre la modification
 */
export async function updateDisplayName(
  userId: string,
  newDisplayName: string
): Promise<ActionResult> {
  try {
    // Validation
    const trimmed = newDisplayName.trim()
    if (!trimmed || trimmed.length < 2 || trimmed.length > 50) {
      return { 
        success: false, 
        error: 'Le nom doit contenir entre 2 et 50 caractères' 
      }
    }
    
    // Vérifier que l'utilisateur n'a pas déjà modifié son nom
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayNameChanged: true },
    })
    
    if (!user) {
      return { success: false, error: 'Utilisateur introuvable' }
    }
    
    if (user.displayNameChanged) {
      return { 
        success: false, 
        error: 'Vous avez déjà modifié votre nom d\'affichage' 
      }
    }
    
    // Mise à jour
    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: trimmed,
        displayNameChanged: true,
      },
    })
    
    revalidatePath('/profile')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Update displayName error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Récupère les statistiques de l'utilisateur
 */
export interface UserStats {
  totalBalance: bigint
  companiesCount: number
  suggestionsCount: number
  votesCount: number
  joinedAt: Date
}

export async function getUserStats(userId: string): Promise<ActionResult<UserStats>> {
  try {
    const [user, accounts, companies, suggestions, votes] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
      prisma.bankAccount.findMany({
        where: { ownerId: userId },
        select: { balance: true },
      }),
      prisma.company.count({
        where: { ownerId: userId },
      }),
      prisma.suggestion.count({
        where: { authorId: userId },
      }),
      prisma.suggestionVote.count({
        where: { userId },
      }),
    ])
    
    if (!user) {
      return { success: false, error: 'Utilisateur introuvable' }
    }
    
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, BigInt(0))
    
    return {
      success: true,
      data: {
        totalBalance,
        companiesCount: companies,
        suggestionsCount: suggestions,
        votesCount: votes,
        joinedAt: user.createdAt,
      },
    }
  } catch (error) {
    console.error('Get user stats error:', error)
    return { success: false, error: 'Erreur lors de la récupération des stats' }
  }
}

/**
 * Initie le changement d'email (envoie un email de confirmation)
 * Note: La vérification finale se fait via Supabase
 */
export async function initiateEmailChange(
  userId: string,
  newEmail: string
): Promise<ActionResult> {
  // Validation basique
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    return { success: false, error: 'Email invalide' }
  }
  
  // La logique réelle d'envoi d'email est gérée par Supabase
  // Cette action est principalement un placeholder pour l'UI
  return { 
    success: true,
    // En production, on intégrerait Supabase auth admin ici
  }
}

/**
 * Initie le changement de mot de passe
 * Note: La vérification finale se fait via Supabase
 */
export async function initiatePasswordChange(userId: string): Promise<ActionResult> {
  // La logique réelle est gérée par Supabase
  // Cette action est principalement un placeholder pour l'UI
  return { success: true }
}
