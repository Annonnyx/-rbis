// ============================================
// app/actions/alliance.ts
// Server Actions pour alliances et trésorerie
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { toCentimes, toOrbe } from '@/lib/currency'
import type { ActionResult } from '@/types'
import type { Alliance, AllianceMember, AllianceTreasury } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface CreateAllianceData {
  name: string
  description: string
  type: 'SYNDICATE' | 'COOPERATIVE'
}

export interface AllianceWithDetails extends Alliance {
  founder: { id: string; username: string; displayName: string | null }
  members: (AllianceMember & {
    user: { id: string; username: string; displayName: string | null }
  })[]
  treasury: AllianceTreasury | null
  _count: { members: number }
}

// ============================================
// CRÉATION ET GESTION
// ============================================

/**
 * Crée une nouvelle alliance
 */
export async function createAlliance(
  userId: string,
  data: CreateAllianceData
): Promise<ActionResult<{ allianceId: string }>> {
  try {
    // Validation
    const name = data.name.trim()
    if (!name || name.length < 3 || name.length > 50) {
      return { success: false, error: 'Nom invalide (3-50 caractères)' }
    }
    
    const description = data.description.trim()
    if (!description || description.length > 500) {
      return { success: false, error: 'Description invalide (max 500 caractères)' }
    }
    
    // Vérifier que l'utilisateur n'est pas déjà dans une alliance
    const existingMembership = await prisma.allianceMember.findFirst({
      where: { userId },
    })
    
    if (existingMembership) {
      return { success: false, error: 'Vous faites déjà partie d\'une alliance' }
    }
    
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'alliance
      const alliance = await tx.alliance.create({
        data: {
          name,
          description,
          type: data.type,
          founderId: userId,
        },
      })
      
      // Ajouter le fondateur comme membre
      await tx.allianceMember.create({
        data: {
          allianceId: alliance.id,
          userId,
          role: 'FOUNDER',
        },
      })
      
      // Créer la trésorerie
      await tx.allianceTreasury.create({
        data: {
          allianceId: alliance.id,
          balance: BigInt(0),
        },
      })
      
      return alliance
    })
    
    revalidatePath('/alliances')
    
    return { success: true, data: { allianceId: result.id } }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Ce nom d\'alliance est déjà pris' }
    }
    console.error('Create alliance error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Invite un membre par username
 */
export async function inviteMember(
  userId: string,
  allianceId: string,
  targetUsername: string
): Promise<ActionResult> {
  try {
    // Vérifier les permissions
    const membership = await prisma.allianceMember.findUnique({
      where: {
        allianceId_userId: {
          allianceId,
          userId,
        },
      },
    })
    
    if (!membership || (membership.role !== 'FOUNDER' && membership.role !== 'ADMIN')) {
      return { success: false, error: 'Non autorisé' }
    }
    
    // Trouver l'utilisateur cible
    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername.toLowerCase() },
      select: { id: true },
    })
    
    if (!targetUser) {
      return { success: false, error: 'Utilisateur introuvable' }
    }
    
    // Vérifier qu'il n'est pas déjà membre
    const existing = await prisma.allianceMember.findUnique({
      where: {
        allianceId_userId: {
          allianceId,
          userId: targetUser.id,
        },
      },
    })
    
    if (existing) {
      return { success: false, error: 'Cet utilisateur est déjà membre' }
    }
    
    // Ajouter comme membre (pas d'invite system pour l'instant, direct)
    await prisma.allianceMember.create({
      data: {
        allianceId,
        userId: targetUser.id,
        role: 'MEMBER',
      },
    })
    
    revalidatePath(`/alliances/${allianceId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Exclure un membre (FOUNDER ou ADMIN seulement)
 */
export async function kickMember(
  userId: string,
  allianceId: string,
  targetUserId: string
): Promise<ActionResult> {
  try {
    // Vérifier les permissions
    const membership = await prisma.allianceMember.findUnique({
      where: {
        allianceId_userId: {
          allianceId,
          userId,
        },
      },
    })
    
    if (!membership || (membership.role !== 'FOUNDER' && membership.role !== 'ADMIN')) {
      return { success: false, error: 'Non autorisé' }
    }
    
    // Ne pas pouvoir s'auto-exclure
    if (targetUserId === userId) {
      return { success: false, error: 'Utilisez "Quitter l\'alliance" à la place' }
    }
    
    // Vérifier le rôle de la cible (pas d'exclusion du fondateur)
    const targetMembership = await prisma.allianceMember.findUnique({
      where: {
        allianceId_userId: {
          allianceId,
          userId: targetUserId,
        },
      },
    })
    
    if (!targetMembership) {
      return { success: false, error: 'Membre introuvable' }
    }
    
    if (targetMembership.role === 'FOUNDER') {
      return { success: false, error: 'Impossible d\'exclure le fondateur' }
    }
    
    // Un admin ne peut pas exclure un autre admin
    if (targetMembership.role === 'ADMIN' && membership.role !== 'FOUNDER') {
      return { success: false, error: 'Seul le fondateur peut exclure un admin' }
    }
    
    await prisma.allianceMember.delete({
      where: { id: targetMembership.id },
    })
    
    revalidatePath(`/alliances/${allianceId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Quitter une alliance
 */
export async function leaveAlliance(
  userId: string,
  allianceId: string
): Promise<ActionResult> {
  try {
    const membership = await prisma.allianceMember.findUnique({
      where: {
        allianceId_userId: {
          allianceId,
          userId,
        },
      },
      include: { alliance: true },
    })
    
    if (!membership) {
      return { success: false, error: 'Vous n\'êtes pas membre de cette alliance' }
    }
    
    // Si fondateur, transférer ou supprimer
    if (membership.role === 'FOUNDER') {
      // Vérifier s'il reste des membres
      const otherMembers = await prisma.allianceMember.findMany({
        where: { allianceId, userId: { not: userId } },
        orderBy: { joinedAt: 'asc' },
      })
      
      if (otherMembers.length > 0) {
        // Transférer le fondateur au plus ancien membre
        await prisma.allianceMember.update({
          where: { id: otherMembers[0].id },
          data: { role: 'FOUNDER' },
        })
        await prisma.alliance.update({
          where: { id: allianceId },
          data: { founderId: otherMembers[0].userId },
        })
      } else {
        // Supprimer l'alliance si vide
        await prisma.alliance.delete({
          where: { id: allianceId },
        })
        revalidatePath('/alliances')
        return { success: true }
      }
    }
    
    await prisma.allianceMember.delete({
      where: { id: membership.id },
    })
    
    revalidatePath('/alliances')
    revalidatePath(`/alliances/${allianceId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// TRÉSORERIE
// ============================================

/**
 * Dépose des fonds dans la trésorerie
 */
export async function depositToTreasury(
  userId: string,
  allianceId: string,
  amount: number
): Promise<ActionResult> {
  try {
    const amountInCentimes = toCentimes(amount)
    if (amountInCentimes <= BigInt(0)) {
      return { success: false, error: 'Montant invalide' }
    }
    
    // Vérifier que l'utilisateur est membre
    const membership = await prisma.allianceMember.findUnique({
      where: {
        allianceId_userId: {
          allianceId,
          userId,
        },
      },
    })
    
    if (!membership) {
      return { success: false, error: 'Vous n\'êtes pas membre de cette alliance' }
    }
    
    // Vérifier le solde personnel
    const personalAccount = await prisma.bankAccount.findFirst({
      where: { ownerId: userId, ownerType: 'PERSONAL' },
    })
    
    if (!personalAccount || personalAccount.balance < amountInCentimes) {
      return { success: false, error: 'Solde insuffisant' }
    }
    
    // Transaction atomique
    await prisma.$transaction(async (tx) => {
      // Débiter le compte personnel
      await tx.bankAccount.update({
        where: { id: personalAccount.id },
        data: { balance: { decrement: amountInCentimes } },
      })
      
      // Créditer la trésorerie
      await tx.allianceTreasury.update({
        where: { allianceId },
        data: { balance: { increment: amountInCentimes } },
      })
    })
    
    revalidatePath(`/alliances/${allianceId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Retire des fonds de la trésorerie (FOUNDER seulement)
 */
export async function withdrawFromTreasury(
  userId: string,
  allianceId: string,
  amount: number
): Promise<ActionResult> {
  try {
    const amountInCentimes = toCentimes(amount)
    if (amountInCentimes <= BigInt(0)) {
      return { success: false, error: 'Montant invalide' }
    }
    
    // Vérifier que l'utilisateur est le fondateur
    const membership = await prisma.allianceMember.findUnique({
      where: {
        allianceId_userId: {
          allianceId,
          userId,
        },
      },
    })
    
    if (!membership || membership.role !== 'FOUNDER') {
      return { success: false, error: 'Seul le fondateur peut retirer des fonds' }
    }
    
    // Vérifier le solde de la trésorerie
    const treasury = await prisma.allianceTreasury.findUnique({
      where: { allianceId },
    })
    
    if (!treasury || treasury.balance < amountInCentimes) {
      return { success: false, error: 'Trésorerie insuffisante' }
    }
    
    // Transaction atomique
    await prisma.$transaction(async (tx) => {
      // Débiter la trésorerie
      await tx.allianceTreasury.update({
        where: { allianceId },
        data: { balance: { decrement: amountInCentimes } },
      })
      
      // Créditer le compte personnel
      const personalAccount = await tx.bankAccount.findFirst({
        where: { ownerId: userId, ownerType: 'PERSONAL' },
      })
      
      if (!personalAccount) {
        throw new Error('Compte personnel introuvable')
      }
      
      await tx.bankAccount.update({
        where: { id: personalAccount.id },
        data: { balance: { increment: amountInCentimes } },
      })
    })
    
    revalidatePath(`/alliances/${allianceId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// RÉCUPÉRATION
// ============================================

/**
 * Récupère toutes les alliances
 */
export async function getAlliances(): Promise<ActionResult<AllianceWithDetails[]>> {
  try {
    const alliances = await prisma.alliance.findMany({
      include: {
        founder: { select: { id: true, username: true, displayName: true } },
        members: {
          include: {
            user: { select: { id: true, username: true, displayName: true } },
          },
        },
        treasury: true,
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return { success: true, data: alliances }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère une alliance par ID
 */
export async function getAllianceById(allianceId: string): Promise<ActionResult<AllianceWithDetails>> {
  try {
    const alliance = await prisma.alliance.findUnique({
      where: { id: allianceId },
      include: {
        founder: { select: { id: true, username: true, displayName: true } },
        members: {
          include: {
            user: { select: { id: true, username: true, displayName: true } },
          },
          orderBy: { role: 'asc' },
        },
        treasury: true,
        _count: { select: { members: true } },
      },
    })
    
    if (!alliance) {
      return { success: false, error: 'Alliance introuvable' }
    }
    
    return { success: true, data: alliance }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère l'alliance d'un utilisateur
 */
export async function getUserAlliance(userId: string): Promise<ActionResult<AllianceWithDetails | null>> {
  try {
    const membership = await prisma.allianceMember.findFirst({
      where: { userId },
      include: {
        alliance: {
          include: {
            founder: { select: { id: true, username: true, displayName: true } },
            members: {
              include: {
                user: { select: { id: true, username: true, displayName: true } },
              },
            },
            treasury: true,
            _count: { select: { members: true } },
          },
        },
      },
    })
    
    return { success: true, data: membership?.alliance || null }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
