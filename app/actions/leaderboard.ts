// ============================================
// app/actions/leaderboard.ts
// Server Actions pour classements
// ============================================

'use server'

import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

// ============================================
// TYPES
// ============================================

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string | null
  location: string | null
  value: number | bigint
  hasLegendaryBadge: boolean
}

export type LeaderboardType = 'wealth' | 'entrepreneurs' | 'investors' | 'citizens' | 'production'

// ============================================
// CLASSEMENTS
// ============================================

/**
 * Récupère le classement par richesse totale
 */
export async function getWealthLeaderboard(
  limit: number = 50,
  locationId?: string
): Promise<ActionResult<LeaderboardEntry[]>> {
  try {
    const users = await prisma.user.findMany({
      where: locationId ? { gameProfile: { homeLocationId: locationId } } : {},
      select: {
        id: true,
        username: true,
        displayName: true,
        gameProfile: { select: { homeLocation: { select: { name: true } } } },
        accounts: { select: { balance: true } },
        achievements: {
          where: { achievement: { rarity: 'LEGENDARY' } },
          take: 1,
        },
      },
      take: limit,
    })
    
    const entries: LeaderboardEntry[] = users.map((user, index) => {
      const totalBalance = user.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
      
      return {
        rank: index + 1,
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.gameProfile?.homeLocation?.name || null,
        value: totalBalance,
        hasLegendaryBadge: user.achievements.length > 0,
      }
    }).sort((a, b) => Number(b.value) - Number(a.value))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
    
    return { success: true, data: entries }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère le classement des entrepreneurs
 */
export async function getEntrepreneursLeaderboard(
  limit: number = 50,
  locationId?: string
): Promise<ActionResult<LeaderboardEntry[]>> {
  try {
    const users = await prisma.user.findMany({
      where: locationId ? { gameProfile: { homeLocationId: locationId } } : {},
      select: {
        id: true,
        username: true,
        displayName: true,
        gameProfile: { select: { homeLocation: { select: { name: true } } } },
        companies: {
          select: {
            capitalAccount: { select: { balance: true } },
          },
        },
        achievements: {
          where: { achievement: { rarity: 'LEGENDARY' } },
          take: 1,
        },
      },
      take: limit,
    })
    
    const entries: LeaderboardEntry[] = users.map((user, index) => {
      const companyCount = user.companies.length
      const totalCapital = user.companies.reduce(
        (sum, c) => sum + Number(c.capitalAccount?.balance || 0),
        0
      )
      
      return {
        rank: index + 1,
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.gameProfile?.homeLocation?.name || null,
        value: companyCount * 1000000 + totalCapital, // Score combiné
        hasLegendaryBadge: user.achievements.length > 0,
      }
    }).sort((a, b) => Number(b.value) - Number(a.value))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
    
    return { success: true, data: entries }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère le classement des investisseurs
 */
export async function getInvestorsLeaderboard(
  limit: number = 50,
  locationId?: string
): Promise<ActionResult<LeaderboardEntry[]>> {
  try {
    const holdings = await prisma.sharePortfolio.groupBy({
      by: ['userId'],
      _sum: { quantity: true },
    })
    
    const userIds = holdings.map(h => h.userId)
    
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        ...(locationId ? { gameProfile: { homeLocationId: locationId } } : {}),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        gameProfile: { select: { homeLocation: { select: { name: true } } } },
        portfolio: {
          include: {
            company: { include: { shareInfo: true } },
          },
        },
        achievements: {
          where: { achievement: { rarity: 'LEGENDARY' } },
          take: 1,
        },
      },
      take: limit,
    })
    
    const entries: LeaderboardEntry[] = users.map((user, index) => {
      const portfolioValue = user.portfolio.reduce((sum, holding) => {
        const price = Number(holding.company.shareInfo?.currentPrice || 0)
        return sum + holding.quantity * price
      }, 0)
      
      return {
        rank: index + 1,
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.gameProfile?.homeLocation?.name || null,
        value: portfolioValue,
        hasLegendaryBadge: user.achievements.length > 0,
      }
    }).sort((a, b) => Number(b.value) - Number(a.value))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
    
    return { success: true, data: entries }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère le classement des citoyens (votes de suggestions)
 */
export async function getCitizensLeaderboard(
  limit: number = 50,
  locationId?: string
): Promise<ActionResult<LeaderboardEntry[]>> {
  try {
    const voteCounts = await prisma.suggestionVote.groupBy({
      by: ['userId'],
      _count: { id: true },
    })
    
    const userIds = voteCounts.map(v => v.userId)
    
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        ...(locationId ? { gameProfile: { homeLocationId: locationId } } : {}),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        gameProfile: { select: { homeLocation: { select: { name: true } } } },
        votes: { select: { id: true } },
        suggestions: { select: { id: true } },
        achievements: {
          where: { achievement: { rarity: 'LEGENDARY' } },
          take: 1,
        },
      },
      take: limit,
    })
    
    const entries: LeaderboardEntry[] = users.map((user, index) => {
      const voteScore = user.votes.length + user.suggestions.length * 2
      
      return {
        rank: index + 1,
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.gameProfile?.homeLocation?.name || null,
        value: voteScore,
        hasLegendaryBadge: user.achievements.length > 0,
      }
    }).sort((a, b) => Number(b.value) - Number(a.value))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
    
    return { success: true, data: entries }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère le classement par production
 */
export async function getProductionLeaderboard(
  limit: number = 50,
  locationId?: string
): Promise<ActionResult<LeaderboardEntry[]>> {
  try {
    const inventory = await prisma.companyInventory.groupBy({
      by: ['companyId'],
      _sum: { quantity: true },
    })
    
    const companyIds = inventory.map(i => i.companyId)
    
    const companies = await prisma.company.findMany({
      where: {
        id: { in: companyIds },
        ...(locationId ? { locationId } : {}),
      },
      select: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            gameProfile: { select: { homeLocation: { select: { name: true } } } },
            achievements: {
              where: { achievement: { rarity: 'LEGENDARY' } },
              take: 1,
            },
          },
        },
        inventory: { select: { quantity: true } },
      },
      take: limit,
    })
    
    // Agréger par utilisateur
    const userMap = new Map<string, LeaderboardEntry>()
    
    for (const company of companies) {
      const user = company.owner
      const productionVolume = company.inventory.reduce((sum, i) => sum + i.quantity, 0)
      
      if (userMap.has(user.id)) {
        const existing = userMap.get(user.id)!
        existing.value = Number(existing.value) + productionVolume
      } else {
        userMap.set(user.id, {
          rank: 0,
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          location: user.gameProfile?.homeLocation?.name || null,
          value: productionVolume,
          hasLegendaryBadge: user.achievements.length > 0,
        })
      }
    }
    
    const entries = Array.from(userMap.values())
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
    
    return { success: true, data: entries }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère le classement global (top 10 pour spectateur)
 */
export async function getGlobalLeaderboardSnapshot(): Promise<ActionResult<{
  wealth: LeaderboardEntry[]
  entrepreneurs: LeaderboardEntry[]
  investors: LeaderboardEntry[]
}>> {
  try {
    const [wealth, entrepreneurs, investors] = await Promise.all([
      getWealthLeaderboard(10),
      getEntrepreneursLeaderboard(10),
      getInvestorsLeaderboard(10),
    ])
    
    return {
      success: true,
      data: {
        wealth: wealth.success ? wealth.data : [],
        entrepreneurs: entrepreneurs.success ? entrepreneurs.data : [],
        investors: investors.success ? investors.data : [],
      },
    }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
