// ============================================
// app/actions/market.ts
// Server Actions pour la bourse et le marché financier
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { toCentimes, toOrbe } from '@/lib/currency'
import type { ActionResult } from '@/types'
import type { MarketListingStatus } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface IPOData {
  totalShares: number
  pricePerShare: number // en Orbe (décimal)
}

export interface MarketListingData {
  companyId: string
  quantity: number
  askingPrice: number // en Orbe (décimal)
}

export interface ListedCompany {
  id: string
  name: string
  objective: string
  owner: { username: string; displayName: string | null }
  shareInfo: {
    totalShares: number
    availableShares: number
    currentPrice: bigint
    lastPriceUpdate: Date
    isListed: boolean
  } | null
  priceHistory: { price: bigint; recordedAt: Date }[]
}

export interface UserHolding {
  companyId: string
  companyName: string
  quantity: number
  averageBuyPrice: bigint
  currentPrice: bigint
  currentValue: bigint
  profitLoss: bigint
}

export interface ActiveListing {
  id: string
  sellerId: string
  sellerName: string
  companyId: string
  companyName: string
  quantity: number
  askingPrice: bigint
  askingPriceTotal: bigint
  createdAt: Date
}

// ============================================
// IPO & COTATION
// ============================================

/**
 * Introduit une entreprise en bourse (IPO)
 * Vérifie que l'entreprise a un capital > ◎ 1 000,00
 * 30% des actions sont vendues à l'IPO, 70% restent à l'entreprise
 */
export async function listCompanyOnMarket(
  userId: string,
  companyId: string,
  data: IPOData
): Promise<ActionResult> {
  const MIN_IPO_CAPITAL = 100000n // ◎ 1 000,00 en centimes
  const MIN_SHARE_PRICE = 10n // ◎ 0,10 en centimes (min ◎ 0,01 = 1 centime)
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérifier ownership et eligibility
      const company = await tx.company.findUnique({
        where: { id: companyId },
        include: { 
          capitalAccount: true,
          shareInfo: true,
        },
      })
      
      if (!company || company.ownerId !== userId) {
        throw new Error('Entreprise introuvable ou non autorisé')
      }
      
      if (company.shareInfo?.isListed) {
        throw new Error('L\'entreprise est déjà cotée en bourse')
      }
      
      if (company.capitalAccount.balance < MIN_IPO_CAPITAL) {
        throw new Error(`Capital insuffisant. Minimum requis: ◎ 1 000,00`)
      }
      
      // 2. Validation des données
      const totalShares = Math.floor(data.totalShares)
      const pricePerShare = toCentimes(data.pricePerShare)
      
      if (totalShares < 100 || totalShares > 1000000) {
        throw new Error('Nombre d\'actions invalide (min 100, max 1 000 000)')
      }
      
      if (pricePerShare < 1n) { // min ◎ 0,01 = 1 centime
        throw new Error('Prix minimum par action: ◎ 0,01')
      }
      
      // 3. Calculer la répartition : 30% IPO, 70% entreprise
      const ipoShares = Math.floor(totalShares * 0.3)
      const companyShares = totalShares - ipoShares
      const ipoRevenue = BigInt(ipoShares) * pricePerShare
      
      // 4. Créer les informations boursières
      await tx.companyShare.create({
        data: {
          companyId,
          totalShares,
          availableShares: ipoShares, // 30% disponibles à l'achat
          currentPrice: pricePerShare,
          isListed: true,
        },
      })
      
      // 5. Créer le portfolio de l'entreprise (70% des actions)
      await tx.sharePortfolio.create({
        data: {
          userId: company.ownerId,
          companyId,
          quantity: companyShares,
          averageBuyPrice: 0n, // L'entreprise n'a pas "acheté" ses propres actions
        },
      })
      
      // 6. Verser les revenus de l'IPO sur le compte entreprise
      await tx.bankAccount.update({
        where: { id: company.capitalAccountId },
        data: { balance: { increment: ipoRevenue } },
      })
      
      // 7. Enregistrer l'historique des prix initial
      await tx.priceHistory.create({
        data: {
          companyId,
          price: pricePerShare,
          volume: 0,
        },
      })
      
      // 8. Créer une transaction fictive pour l'IPO
      await tx.shareTransaction.create({
        data: {
          buyerId: userId, // L'entreprise "achète" ses propres actions initiales
          companyId,
          quantity: companyShares,
          pricePerShare,
          totalAmount: 0n,
        },
      })
      
      return { companyId, ipoShares, companyShares, ipoRevenue }
    })
    
    revalidatePath('/market')
    revalidatePath(`/company/${companyId}`)
    
    return { 
      success: true, 
      data: { 
        companyId: result.companyId,
        ipoShares: result.ipoShares,
        companyShares: result.companyShares,
      }
    }
  } catch (error: any) {
    console.error('IPO error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// ACHAT D'ACTIONS
// ============================================

/**
 * Achète des actions directement depuis l'entreprise (primary market)
 * ou via une annonce du marché secondaire
 */
export async function buyShares(
  userId: string,
  companyId: string,
  quantity: number,
  listingId?: string
): Promise<ActionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Récupérer les informations
      const shareInfo = await tx.companyShare.findUnique({
        where: { companyId },
        include: { company: { include: { capitalAccount: true } } },
      })
      
      if (!shareInfo || !shareInfo.isListed) {
        throw new Error('Entreprise non cotée en bourse')
      }
      
      // 2. Vérifier le compte personnel de l'acheteur
      const buyerAccount = await tx.bankAccount.findFirst({
        where: { ownerId: userId, ownerType: 'PERSONAL' },
      })
      
      if (!buyerAccount) {
        throw new Error('Compte bancaire introuvable')
      }
      
      let pricePerShare = shareInfo.currentPrice
      let sellerId: string | null = null
      let totalAmount: bigint
      
      // 3. Si achat via listing secondaire
      if (listingId) {
        const listing = await tx.marketListing.findUnique({
          where: { id: listingId },
          include: { seller: true },
        })
        
        if (!listing || listing.status !== 'ACTIVE' || listing.companyId !== companyId) {
          throw new Error('Annonce invalide ou expirée')
        }
        
        if (listing.quantity < quantity) {
          throw new Error('Quantité insuffisante dans cette annonce')
        }
        
        pricePerShare = listing.askingPrice
        sellerId = listing.sellerId
        
        // Vérifier que l'acheteur n'achète pas à lui-même
        if (sellerId === userId) {
          throw new Error('Vous ne pouvez pas acheter vos propres actions')
        }
      }
      
      totalAmount = BigInt(quantity) * pricePerShare
      
      // 4. Vérifier le solde
      if (buyerAccount.balance < totalAmount) {
        throw new Error('Solde insuffisant')
      }
      
      // 5. Vérifier la disponibilité
      if (!sellerId && shareInfo.availableShares < quantity) {
        throw new Error(`Seulement ${shareInfo.availableShares} actions disponibles`)
      }
      
      // 6. Effectuer la transaction
      // 6a. Débiter l'acheteur
      await tx.bankAccount.update({
        where: { id: buyerAccount.id },
        data: { balance: { decrement: totalAmount } },
      })
      
      // 6b. Créditer le vendeur ou l'entreprise
      if (sellerId) {
        const sellerAccount = await tx.bankAccount.findFirst({
          where: { ownerId: sellerId, ownerType: 'PERSONAL' },
        })
        if (sellerAccount) {
          await tx.bankAccount.update({
            where: { id: sellerAccount.id },
            data: { balance: { increment: totalAmount } },
          })
        }
        
        // Mettre à jour ou supprimer le listing
        const listing = await tx.marketListing.findUnique({
          where: { id: listingId },
        })
        if (listing) {
          if (listing.quantity === quantity) {
            await tx.marketListing.update({
              where: { id: listingId },
              data: { status: 'SOLD', soldAt: new Date() },
            })
          } else {
            await tx.marketListing.update({
              where: { id: listingId },
              data: { quantity: listing.quantity - quantity },
            })
          }
        }
        
        // Mettre à jour le portfolio du vendeur
        const sellerPortfolio = await tx.sharePortfolio.findUnique({
          where: { userId_companyId: { userId: sellerId, companyId } },
        })
        if (sellerPortfolio) {
          if (sellerPortfolio.quantity === quantity) {
            await tx.sharePortfolio.delete({
              where: { id: sellerPortfolio.id },
            })
          } else {
            await tx.sharePortfolio.update({
              where: { id: sellerPortfolio.id },
              data: { quantity: sellerPortfolio.quantity - quantity },
            })
          }
        }
      } else {
        // Achat primaire : créditer l'entreprise
        await tx.bankAccount.update({
          where: { id: shareInfo.company.capitalAccountId },
          data: { balance: { increment: totalAmount } },
        })
        
        // Mettre à jour les actions disponibles
        await tx.companyShare.update({
          where: { companyId },
          data: { availableShares: shareInfo.availableShares - quantity },
        })
      }
      
      // 6c. Créer ou mettre à jour le portfolio de l'acheteur
      const existingPortfolio = await tx.sharePortfolio.findUnique({
        where: { userId_companyId: { userId, companyId } },
      })
      
      if (existingPortfolio) {
        // Calculer le nouveau prix moyen pondéré
        const oldValue = BigInt(existingPortfolio.quantity) * existingPortfolio.averageBuyPrice
        const newValue = BigInt(quantity) * pricePerShare
        const totalQuantity = existingPortfolio.quantity + quantity
        const newAveragePrice = (oldValue + newValue) / BigInt(totalQuantity)
        
        await tx.sharePortfolio.update({
          where: { id: existingPortfolio.id },
          data: {
            quantity: totalQuantity,
            averageBuyPrice: newAveragePrice,
          },
        })
      } else {
        await tx.sharePortfolio.create({
          data: {
            userId,
            companyId,
            quantity,
            averageBuyPrice: pricePerShare,
          },
        })
      }
      
      // 6d. Enregistrer la transaction
      await tx.shareTransaction.create({
        data: {
          buyerId: userId,
          sellerId,
          companyId,
          quantity,
          pricePerShare,
          totalAmount,
        },
      })
      
      // 7. Mettre à jour le prix (moyenne pondérée des 10 dernières transactions)
      const recentTransactions = await tx.shareTransaction.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      
      if (recentTransactions.length > 0) {
        let totalValue = 0n
        let totalQty = 0
        for (const t of recentTransactions) {
          totalValue += t.totalAmount
          totalQty += t.quantity
        }
        const newPrice = totalValue / BigInt(totalQty)
        
        // Prix minimum ◎ 0,01
        const finalPrice = newPrice < 1n ? 1n : newPrice
        
        await tx.companyShare.update({
          where: { companyId },
          data: {
            currentPrice: finalPrice,
            lastPriceUpdate: new Date(),
          },
        })
        
        // Enregistrer dans l'historique
        await tx.priceHistory.create({
          data: {
            companyId,
            price: finalPrice,
            volume: quantity,
          },
        })
      }
      
      return { quantity, totalAmount, pricePerShare }
    })
    
    revalidatePath('/market')
    revalidatePath(`/company/${companyId}`)
    
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Buy shares error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// MARCHÉ SECONDAIRE (LISTINGS)
// ============================================

/**
 * Crée une annonce de vente sur le marché secondaire
 */
export async function createMarketListing(
  userId: string,
  data: MarketListingData
): Promise<ActionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérifier le portfolio
      const portfolio = await tx.sharePortfolio.findUnique({
        where: { userId_companyId: { userId, companyId: data.companyId } },
      })
      
      if (!portfolio || portfolio.quantity < data.quantity) {
        throw new Error('Vous ne possédez pas assez d\'actions')
      }
      
      // 2. Vérifier que l'entreprise est cotée
      const shareInfo = await tx.companyShare.findUnique({
        where: { companyId: data.companyId },
      })
      
      if (!shareInfo?.isListed) {
        throw new Error('Entreprise non cotée')
      }
      
      // 3. Vérifier le prix minimum
      const askingPrice = toCentimes(data.askingPrice)
      if (askingPrice < 1n) {
        throw new Error('Prix minimum: ◎ 0,01')
      }
      
      // 4. Créer l'annonce
      const listing = await tx.marketListing.create({
        data: {
          sellerId: userId,
          companyId: data.companyId,
          quantity: data.quantity,
          askingPrice,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        },
      })
      
      return listing
    })
    
    revalidatePath('/market')
    
    return { success: true, data: { listingId: result.id } }
  } catch (error: any) {
    console.error('Create listing error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Accepte une annonce du marché secondaire (achat)
 * Wrapper autour de buyShares avec listingId
 */
export async function acceptMarketListing(
  buyerId: string,
  listingId: string
): Promise<ActionResult> {
  try {
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
    })
    
    if (!listing || listing.status !== 'ACTIVE') {
      return { success: false, error: 'Annonce invalide ou expirée' }
    }
    
    return buyShares(buyerId, listing.companyId, listing.quantity, listingId)
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Annule une annonce de vente
 */
export async function cancelMarketListing(
  userId: string,
  listingId: string
): Promise<ActionResult> {
  try {
    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
    })
    
    if (!listing || listing.sellerId !== userId) {
      return { success: false, error: 'Annonce introuvable ou non autorisée' }
    }
    
    if (listing.status !== 'ACTIVE') {
      return { success: false, error: 'Cette annonce ne peut plus être annulée' }
    }
    
    await prisma.marketListing.update({
      where: { id: listingId },
      data: { status: 'CANCELLED' },
    })
    
    revalidatePath('/market')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// RÉCUPÉRATION DE DONNÉES
// ============================================

/**
 * Récupère les données du marché (entreprises cotées)
 */
export async function getMarketData(): Promise<ActionResult<ListedCompany[]>> {
  try {
    const companies = await prisma.company.findMany({
      where: {
        shareInfo: { isListed: true },
      },
      include: {
        owner: { select: { username: true, displayName: true } },
        shareInfo: true,
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 24, // 24 dernières heures
        },
      },
      orderBy: {
        shareInfo: { currentPrice: 'desc' },
      },
    })
    
    return { success: true, data: companies }
  } catch (error) {
    console.error('Get market data error:', error)
    return { success: false, error: 'Erreur lors de la récupération des données' }
  }
}

/**
 * Récupère le portfolio d'un utilisateur
 */
export async function getUserPortfolio(userId: string): Promise<ActionResult<UserHolding[]>> {
  try {
    const holdings = await prisma.sharePortfolio.findMany({
      where: { userId },
      include: {
        company: {
          include: { shareInfo: true },
        },
      },
    })
    
    const formattedHoldings: UserHolding[] = holdings.map(h => {
      const currentPrice = h.company.shareInfo?.currentPrice || 0n
      const currentValue = BigInt(h.quantity) * currentPrice
      const investedValue = BigInt(h.quantity) * h.averageBuyPrice
      const profitLoss = currentValue - investedValue
      
      return {
        companyId: h.companyId,
        companyName: h.company.name,
        quantity: h.quantity,
        averageBuyPrice: h.averageBuyPrice,
        currentPrice,
        currentValue,
        profitLoss,
      }
    })
    
    // Calculer la valeur totale
    const totalValue = formattedHoldings.reduce((sum, h) => sum + h.currentValue, 0n)
    const totalInvested = formattedHoldings.reduce((sum, h) => sum + BigInt(h.quantity) * h.averageBuyPrice, 0n)
    const totalProfitLoss = totalValue - totalInvested
    
    return { 
      success: true, 
      data: formattedHoldings,
      meta: {
        totalValue,
        totalInvested,
        totalProfitLoss,
        totalCompanies: holdings.length,
      }
    }
  } catch (error) {
    console.error('Get user portfolio error:', error)
    return { success: false, error: 'Erreur lors de la récupération du portfolio' }
  }
}

/**
 * Récupère les annonces actives du marché secondaire
 */
export async function getActiveListings(): Promise<ActionResult<ActiveListing[]>> {
  try {
    const listings = await prisma.marketListing.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      include: {
        seller: { select: { username: true, displayName: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    const formattedListings: ActiveListing[] = listings.map(l => ({
      id: l.id,
      sellerId: l.sellerId,
      sellerName: l.seller.displayName || l.seller.username,
      companyId: l.companyId,
      companyName: l.company.name,
      quantity: l.quantity,
      askingPrice: l.askingPrice,
      askingPriceTotal: l.askingPrice * BigInt(l.quantity),
      createdAt: l.createdAt,
    }))
    
    return { success: true, data: formattedListings }
  } catch (error) {
    console.error('Get active listings error:', error)
    return { success: false, error: 'Erreur lors de la récupération des annonces' }
  }
}

/**
 * Récupère l'historique des prix d'une entreprise
 */
export async function getPriceHistory(
  companyId: string,
  period: '1d' | '7d' | '30d' | 'all' = '7d'
): Promise<ActionResult<{ price: bigint; recordedAt: Date; volume: number }[]>> {
  try {
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0)
    }
    
    const history = await prisma.priceHistory.findMany({
      where: {
        companyId,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
    })
    
    return { success: true, data: history }
  } catch (error) {
    console.error('Get price history error:', error)
    return { success: false, error: 'Erreur lors de la récupération de l\'historique' }
  }
}

/**
 * Récupère les transactions d'une entreprise
 */
export async function getCompanyTransactions(
  companyId: string,
  limit: number = 20
): Promise<ActionResult<{
  id: string
  buyer: string
  seller: string | null
  quantity: number
  pricePerShare: bigint
  totalAmount: bigint
  createdAt: Date
}[]>> {
  try {
    const transactions = await prisma.shareTransaction.findMany({
      where: { companyId },
      include: {
        buyer: { select: { username: true, displayName: true } },
        seller: { select: { username: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    
    const formatted = transactions.map(t => ({
      id: t.id,
      buyer: t.buyer.displayName || t.buyer.username,
      seller: t.seller?.displayName || t.seller?.username || null,
      quantity: t.quantity,
      pricePerShare: t.pricePerShare,
      totalAmount: t.totalAmount,
      createdAt: t.createdAt,
    }))
    
    return { success: true, data: formatted }
  } catch (error) {
    console.error('Get company transactions error:', error)
    return { success: false, error: 'Erreur' }
  }
}
