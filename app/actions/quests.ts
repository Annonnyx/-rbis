// ============================================
// app/actions/quests.ts
// Server Actions pour système de quêtes
// ============================================

'use server'

import { prisma } from '@/lib/prisma'
import { toOrbe } from '@/lib/currency'
import type { ActionResult } from '@/types'
import type { QuestTemplate, UserQuest } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface UserQuestWithTemplate extends UserQuest {
  questTemplate: QuestTemplate
}

// ============================================
// ASSIGNER LES QUÊTES
// ============================================

/**
 * Assigne les quêtes permanentes à un nouvel utilisateur
 */
export async function assignPermanentQuests(userId: string): Promise<ActionResult> {
  try {
    const permanentQuests = await prisma.questTemplate.findMany({
      where: { type: 'PERMANENT', active: true },
    })
    
    for (const quest of permanentQuests) {
      await prisma.userQuest.upsert({
        where: {
          userId_questTemplateId: {
            userId,
            questTemplateId: quest.id,
          },
        },
        update: {},
        create: {
          userId,
          questTemplateId: quest.id,
          progress: { current: 0, target: (quest.requirement as any)?.target ?? 0 },
          status: 'ACTIVE',
        },
      })
    }
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Génère les quêtes DAILY pour un utilisateur (appelé par cron ou login)
 */
export async function generateDailyQuests(userId: string): Promise<ActionResult> {
  try {
    // Supprimer les anciennes quêtes daily expirées
    await prisma.userQuest.deleteMany({
      where: {
        userId,
        questTemplate: { type: 'DAILY' },
        status: { in: ['COMPLETED', 'EXPIRED'] },
      },
    })
    
    // Vérifier si l'utilisateur a déjà des daily actives
    const existingDaily = await prisma.userQuest.count({
      where: {
        userId,
        questTemplate: { type: 'DAILY' },
        status: 'ACTIVE',
      },
    })
    
    if (existingDaily > 0) {
      return { success: true } // Déjà des daily actives
    }
    
    // Sélectionner 3 quêtes daily aléatoires
    const dailyQuests = await prisma.questTemplate.findMany({
      where: { type: 'DAILY', active: true },
    })
    
    const selectedQuests = dailyQuests
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    const expiresAt = new Date()
    expiresAt.setUTCHours(24, 0, 0, 0) // Minuit UTC
    
    for (const quest of selectedQuests) {
      await prisma.userQuest.create({
        data: {
          userId,
          questTemplateId: quest.id,
          progress: { current: 0, target: (quest.requirement as any)?.target ?? 0 },
          status: 'ACTIVE',
          expiresAt,
        },
      })
    }
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Génère les quêtes WEEKLY pour un utilisateur
 */
export async function generateWeeklyQuests(userId: string): Promise<ActionResult> {
  try {
    // Supprimer les anciennes quêtes weekly expirées
    await prisma.userQuest.deleteMany({
      where: {
        userId,
        questTemplate: { type: 'WEEKLY' },
        status: { in: ['COMPLETED', 'EXPIRED'] },
      },
    })
    
    // Vérifier si l'utilisateur a déjà des weekly actives
    const existingWeekly = await prisma.userQuest.count({
      where: {
        userId,
        questTemplate: { type: 'WEEKLY' },
        status: 'ACTIVE',
      },
    })
    
    if (existingWeekly > 0) {
      return { success: true }
    }
    
    // Sélectionner 5 quêtes weekly aléatoires
    const weeklyQuests = await prisma.questTemplate.findMany({
      where: { type: 'WEEKLY', active: true },
    })
    
    const selectedQuests = weeklyQuests
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
    
    // Prochain lundi minuit UTC
    const now = new Date()
    const dayOfWeek = now.getUTCDay()
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7
    const expiresAt = new Date(now)
    expiresAt.setUTCDate(now.getUTCDate() + daysUntilMonday)
    expiresAt.setUTCHours(0, 0, 0, 0)
    
    for (const quest of selectedQuests) {
      await prisma.userQuest.create({
        data: {
          userId,
          questTemplateId: quest.id,
          progress: { current: 0, target: (quest.requirement as any)?.target ?? 0 },
          status: 'ACTIVE',
          expiresAt,
        },
      })
    }
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// MISE À JOUR DE LA PROGRESSION
// ============================================

/**
 * Met à jour la progression d'une quête (fire-and-forget)
 */
export async function updateQuestProgress(
  userId: string,
  actionType: string,
  value: number = 1
): Promise<void> {
  try {
    // Trouver les quêtes actives de cet utilisateur qui correspondent à l'action
    const activeQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        questTemplate: {
          requirement: { path: ['type'], equals: actionType },
        },
      },
      include: { questTemplate: true },
    })
    
    for (const quest of activeQuests) {
      const currentProgress = (quest.progress as any)?.current || 0
      const target = (quest.questTemplate.requirement as any)?.target as number ?? 0
      const newProgress = currentProgress + value
      
      if (newProgress >= target) {
        // Compléter la quête
        await prisma.userQuest.update({
          where: { id: quest.id },
          data: {
            status: 'COMPLETED',
            progress: { current: target, target },
            completedAt: new Date(),
          },
        })
        
        // Distribuer les récompenses
        await distributeQuestRewards(userId, quest.questTemplate)
      } else {
        // Mettre à jour la progression
        await prisma.userQuest.update({
          where: { id: quest.id },
          data: {
            progress: { current: newProgress, target },
          },
        })
      }
    }
  } catch (error) {
    // Fire-and-forget: silencieux
    console.error('Quest progress update failed:', error)
  }
}

/**
 * Distribue les récompenses d'une quête
 */
async function distributeQuestRewards(
  userId: string,
  questTemplate: QuestTemplate
): Promise<void> {
  try {
    // Récompense en Orbes
    if (questTemplate.rewardOrbes > 0) {
      const personalAccount = await prisma.bankAccount.findFirst({
        where: { ownerId: userId, ownerType: 'PERSONAL' },
      })
      
      if (personalAccount) {
        await prisma.bankAccount.update({
          where: { id: personalAccount.id },
          data: { balance: { increment: questTemplate.rewardOrbes } },
        })
      }
    }
    
    // Récompense en XP (si définie)
    if (questTemplate.rewardXp) {
      const xpRewards = questTemplate.rewardXp as any[]
      for (const xpReward of xpRewards) {
        await prisma.userSkill.updateMany({
          where: {
            userId,
            skillCategory: { name: xpReward.skillCategory },
          },
          data: {
            experience: { increment: xpReward.amount },
          },
        })
      }
    }
  } catch (error) {
    console.error('Quest reward distribution failed:', error)
  }
}

// ============================================
// RÉCUPÉRATION
// ============================================

export async function getUserQuests(
  userId: string,
  type?: 'DAILY' | 'WEEKLY' | 'PERMANENT'
): Promise<ActionResult<UserQuestWithTemplate[]>> {
  try {
    const where: any = { userId }
    
    if (type) {
      where.questTemplate = { type }
    }
    
    const quests = await prisma.userQuest.findMany({
      where,
      include: { questTemplate: true },
      orderBy: { status: 'asc' },
    })
    
    return { success: true, data: quests }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

export async function getQuestStats(userId: string): Promise<ActionResult<{
  completed: number
  active: number
  totalOrbesEarned: number
}>> {
  try {
    const [completed, active, completedQuests] = await Promise.all([
      prisma.userQuest.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.userQuest.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.userQuest.findMany({
        where: { userId, status: 'COMPLETED' },
        include: { questTemplate: true },
      }),
    ])
    
    const totalOrbesEarned = completedQuests.reduce(
      (sum, q) => sum + Number(q.questTemplate.rewardOrbes),
      0
    )
    
    return { 
      success: true, 
      data: { completed, active, totalOrbesEarned } 
    }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
