// ============================================
// app/actions/achievements.ts
// Server Actions pour système de réalisations/badges
// ============================================

'use server'

import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'
import type { Achievement, UserAchievement } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface UserAchievementWithAchievement extends UserAchievement {
  achievement: Achievement
}

export interface AchievementProgress {
  achievement: Achievement
  unlocked: boolean
  unlockedAt?: Date
}

// ============================================
// VÉRIFICATION DES RÉALISATIONS
// ============================================

/**
 * Vérifie et débloque les réalisations après une action (async, non-bloquant)
 */
export async function checkAchievements(userId: string): Promise<void> {
  try {
    // Récupérer les stats de l'utilisateur
    const [
      companyCount,
      transactionCount,
      messageCount,
      voteCount,
      portfolioValue,
      totalBalance,
      userAchievements,
      productionCycles,
    ] = await Promise.all([
      prisma.company.count({ where: { ownerId: userId } }),
      prisma.transaction.count({ where: { OR: [{ fromAccount: { ownerId: userId } }, { toAccount: { ownerId: userId } }] } }),
      prisma.message.count({ where: { senderId: userId } }),
      prisma.suggestionVote.count({ where: { userId } }),
      getPortfolioValue(userId),
      getTotalBalance(userId),
      prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
      prisma.companyInventory.aggregate({ _sum: { quantity: true } }),
    ])
    
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId))
    
    // Récupérer tous les achievements non débloqués
    const achievements = await prisma.achievement.findMany({
      where: {
        id: { notIn: Array.from(unlockedAchievementIds) },
      },
    })
    
    for (const achievement of achievements) {
      const condition = achievement.condition as any
      let shouldUnlock = false
      
      switch (condition.type) {
        case 'company_created':
          shouldUnlock = companyCount >= condition.target
          break
        case 'transaction_count':
          shouldUnlock = transactionCount >= condition.target
          break
        case 'message_sent':
          shouldUnlock = messageCount >= condition.target
          break
        case 'suggestion_voted':
          shouldUnlock = voteCount >= condition.target
          break
        case 'portfolio_value':
          shouldUnlock = portfolioValue >= condition.target
          break
        case 'total_balance':
          shouldUnlock = totalBalance >= condition.target
          break
        case 'production_cycles':
          // Simplifié - à adapter selon la logique métier
          shouldUnlock = false
          break
        case 'election_won':
          const electionsWon = await prisma.election.count({ where: { winnerId: userId } })
          shouldUnlock = electionsWon >= condition.target
          break
        case 'all_achievements':
          const totalAchievements = await prisma.achievement.count()
          shouldUnlock = userAchievements.length >= totalAchievements - 1
          break
      }
      
      if (shouldUnlock) {
        await unlockAchievement(userId, achievement.id)
      }
    }
  } catch (error) {
    // Non-bloquant: silencieux
    console.error('Achievement check failed:', error)
  }
}

/**
 * Débloque une réalisation pour un utilisateur
 */
async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  try {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        unlockedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Unlock achievement failed:', error)
  }
}

/**
 * Calcule la valeur du portfolio d'un utilisateur
 */
async function getPortfolioValue(userId: string): Promise<number> {
  try {
    const holdings = await prisma.sharePortfolio.findMany({
      where: { userId },
      include: { company: { include: { shareInfo: true } } },
    })
    
    return holdings.reduce((total, holding) => {
      const price = Number(holding.company.shareInfo?.currentPrice || 0)
      return total + holding.quantity * price
    }, 0)
  } catch (error) {
    return 0
  }
}

/**
 * Calcule le solde total d'un utilisateur
 */
async function getTotalBalance(userId: string): Promise<number> {
  try {
    const result = await prisma.bankAccount.aggregate({
      where: { ownerId: userId },
      _sum: { balance: true },
    })
    
    return Number(result._sum.balance || 0)
  } catch (error) {
    return 0
  }
}

// ============================================
// RÉCUPÉRATION
// ============================================

export async function getUserAchievements(
  userId: string
): Promise<ActionResult<UserAchievementWithAchievement[]>> {
  try {
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    })
    
    return { success: true, data: achievements }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

export async function getAllAchievementsWithProgress(
  userId: string
): Promise<ActionResult<AchievementProgress[]>> {
  try {
    const [allAchievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany({ orderBy: { rarity: 'asc' } }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true },
      }),
    ])
    
    const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]))
    
    const progress = allAchievements.map(achievement => ({
      achievement,
      unlocked: unlockedMap.has(achievement.id),
      unlockedAt: unlockedMap.get(achievement.id),
    }))
    
    return { success: true, data: progress }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

export async function hasLegendaryBadge(userId: string): Promise<boolean> {
  try {
    const count = await prisma.userAchievement.count({
      where: {
        userId,
        achievement: { rarity: 'LEGENDARY' },
      },
    })
    
    return count > 0
  } catch (error) {
    return false
  }
}

export async function getAchievementStats(userId: string): Promise<ActionResult<{
  total: number
  unlocked: number
  byRarity: Record<string, number>
}>> {
  try {
    const [total, unlocked, byRarity] = await Promise.all([
      prisma.achievement.count(),
      prisma.userAchievement.count({ where: { userId } }),
      prisma.userAchievement.groupBy({
        by: ['achievement.rarity'],
        where: { userId },
        _count: { achievementId: true },
      }),
    ])
    
    const rarityMap: Record<string, number> = {}
    for (const group of byRarity) {
      rarityMap[group['achievement.rarity']] = group._count.achievementId
    }
    
    return { success: true, data: { total, unlocked, byRarity: rarityMap } }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
