import { db } from "./db"
import { Business, BusinessSubType, PricePositioning, PriceIndicator } from "@prisma/client"

// Configuration des paramètres économiques par sous-type d'entreprise
const BUSINESS_ECONOMICS: Record<BusinessSubType, {
  basePrice: number           // Prix de base recommandé
  minPrice: number            // Prix minimum viable
  maxPrice: number            // Prix maximum acceptable
  baseProductionCost: number  // Coût de production de base
  baseDemand: number          // Demande de base (ventes/heure au prix optimal)
  priceElasticity: number     // Élasticité prix (sensibilité aux changements de prix)
}> = {
  // Clothing
  FAST_FASHION: { basePrice: 15, minPrice: 8, maxPrice: 30, baseProductionCost: 8, baseDemand: 20, priceElasticity: 1.5 },
  READY_TO_WEAR: { basePrice: 45, minPrice: 25, maxPrice: 80, baseProductionCost: 22, baseDemand: 12, priceElasticity: 1.2 },
  LUXURY: { basePrice: 250, minPrice: 120, maxPrice: 500, baseProductionCost: 80, baseDemand: 3, priceElasticity: 0.8 },
  SPORTSWEAR: { basePrice: 35, minPrice: 20, maxPrice: 70, baseProductionCost: 15, baseDemand: 15, priceElasticity: 1.3 },
  ECO_FRIENDLY: { basePrice: 55, minPrice: 30, maxPrice: 100, baseProductionCost: 28, baseDemand: 10, priceElasticity: 1.1 },
  
  // Energy Drinks
  ARTISANAL: { basePrice: 4, minPrice: 2.5, maxPrice: 6, baseProductionCost: 1.5, baseDemand: 30, priceElasticity: 1.4 },
  INDUSTRIAL: { basePrice: 2.5, minPrice: 1.5, maxPrice: 4, baseProductionCost: 0.8, baseDemand: 50, priceElasticity: 1.8 },
  PREMIUM_BIO: { basePrice: 6, minPrice: 3.5, maxPrice: 10, baseProductionCost: 2.2, baseDemand: 18, priceElasticity: 1.2 },
  GAMING: { basePrice: 5, minPrice: 3, maxPrice: 8, baseProductionCost: 1.8, baseDemand: 25, priceElasticity: 1.3 },
  
  // Electronics
  RETAIL: { basePrice: 200, minPrice: 100, maxPrice: 400, baseProductionCost: 120, baseDemand: 5, priceElasticity: 1.4 },
  REPAIR: { basePrice: 80, minPrice: 40, maxPrice: 150, baseProductionCost: 25, baseDemand: 8, priceElasticity: 1.2 },
  MANUFACTURING: { basePrice: 350, minPrice: 200, maxPrice: 600, baseProductionCost: 180, baseDemand: 2, priceElasticity: 1.0 },
  
  // Food & Beverage
  RESTAURANT: { basePrice: 25, minPrice: 15, maxPrice: 45, baseProductionCost: 10, baseDemand: 12, priceElasticity: 1.3 },
  FAST_FOOD: { basePrice: 12, minPrice: 7, maxPrice: 20, baseProductionCost: 4, baseDemand: 25, priceElasticity: 1.6 },
  CAFE: { basePrice: 4, minPrice: 2.5, maxPrice: 7, baseProductionCost: 1.2, baseDemand: 35, priceElasticity: 1.4 },
  BAKERY: { basePrice: 3.5, minPrice: 2, maxPrice: 6, baseProductionCost: 1.0, baseDemand: 28, priceElasticity: 1.5 },
  
  // SaaS
  B2B_SAAS: { basePrice: 150, minPrice: 80, maxPrice: 300, baseProductionCost: 20, baseDemand: 4, priceElasticity: 1.1 },
  B2C_SAAS: { basePrice: 15, minPrice: 8, maxPrice: 30, baseProductionCost: 3, baseDemand: 15, priceElasticity: 1.4 },
  
  // Airline
  LOW_COST: { basePrice: 80, minPrice: 40, maxPrice: 150, baseProductionCost: 35, baseDemand: 20, priceElasticity: 1.7 },
  PREMIUM: { basePrice: 400, minPrice: 200, maxPrice: 800, baseProductionCost: 120, baseDemand: 5, priceElasticity: 1.0 },
  
  // Casino
  CASINO: { basePrice: 50, minPrice: 20, maxPrice: 100, baseProductionCost: 10, baseDemand: 15, priceElasticity: 1.2 },
}

// Multiplicateurs de prix selon le positionnement
const PRICE_MULTIPLIERS: Record<PricePositioning, number> = {
  DISCOUNT: 0.7,
  ACCESSIBLE: 1.0,
  PREMIUM: 1.5,
  LUXE: 2.5,
}

export class BusinessEconomy {
  // Calculer les prix optimaux pour une entreprise
  static calculateOptimalPrices(
    subType?: BusinessSubType,
    pricePositioning?: PricePositioning
  ): { min: number; max: number; recommended: number; productionCost: number } {
    if (!subType || !pricePositioning) {
      throw new Error('subType and pricePositioning are required')
    }

    const economics = BUSINESS_ECONOMICS[subType]
    const multiplier = PRICE_MULTIPLIERS[pricePositioning]
    
    return {
      min: Math.round(economics.minPrice * multiplier),
      max: Math.round(economics.maxPrice * multiplier),
      recommended: Math.round(economics.basePrice * multiplier),
      productionCost: economics.baseProductionCost,
    }
  }

  // Calculer le score de demande (0-100) basé sur le prix
  static calculateDemandScore(
    currentPrice: number,
    optimalMin: number,
    optimalMax: number,
    priceElasticity: number
  ): number {
    const optimalPrice = (optimalMin + optimalMax) / 2
    
    if (currentPrice <= optimalMin) {
      // Prix bas = haute demande mais moins de marge
      return Math.min(95, 70 + (optimalMin - currentPrice) / optimalMin * 30)
    } else if (currentPrice >= optimalMax) {
      // Prix haut = faible demande
      const excess = (currentPrice - optimalMax) / optimalMax
      return Math.max(5, 50 - excess * 50 * priceElasticity)
    } else {
      // Dans la fourchette optimale
      const deviation = Math.abs(currentPrice - optimalPrice) / optimalPrice
      return Math.round(85 - deviation * 20)
    }
  }

  // Déterminer l'indicateur de prix
  static getPriceIndicator(
    currentPrice: number,
    optimalMin: number,
    optimalMax: number
  ): PriceIndicator {
    if (currentPrice < optimalMin * 0.9) return PriceIndicator.TOO_CHEAP
    if (currentPrice > optimalMax * 1.1) return PriceIndicator.TOO_EXPENSIVE
    return PriceIndicator.GOOD
  }

  // Calculer le nombre de ventes par heure
  static calculateHourlySales(
    subType: BusinessSubType,
    currentPrice: number,
    optimalMin: number,
    optimalMax: number,
    footTraffic: number, // 0-100
    customerSatisfaction: number, // 0-100
    stock: number
  ): number {
    const economics = BUSINESS_ECONOMICS[subType]
    const demandScore = this.calculateDemandScore(currentPrice, optimalMin, optimalMax, economics.priceElasticity)
    
    // Base: ventes potentielles selon la demande
    const baseSales = economics.baseDemand * (demandScore / 100)
    
    // Multiplicateur trafic (0.5 à 1.5)
    const trafficMultiplier = 0.5 + (footTraffic / 100) * 1.0
    
    // Multiplicateur satisfaction (0.7 à 1.3)
    const satisfactionMultiplier = 0.7 + (customerSatisfaction / 100) * 0.6
    
    // Calcul final
    const potentialSales = baseSales * trafficMultiplier * satisfactionMultiplier
    
    // Limité par le stock disponible (on ne peut pas vendre plus que ce qu'on a)
    return Math.min(Math.round(potentialSales), stock)
  }

  // Calculer le revenu et les coûts pour une période donnée
  static calculateRevenue(
    business: Business & { location?: { footTraffic: number } | null },
    hours: number = 1
  ): {
    sales: number
    revenue: number
    productionCost: number
    profit: number
    stockConsumed: number
  } {
    if (!business.subType || !business.pricePositioning || !business.productPrice) {
      return { sales: 0, revenue: 0, productionCost: 0, profit: 0, stockConsumed: 0 }
    }

    const economics = BUSINESS_ECONOMICS[business.subType]
    const footTraffic = business.location?.footTraffic || 50
    
    // Calculer les prix optimaux
    const optimalPrices = this.calculateOptimalPrices(business.subType, business.pricePositioning)
    
    // Ventes par heure
    const hourlySales = this.calculateHourlySales(
      business.subType,
      Number(business.productPrice),
      optimalPrices.min,
      optimalPrices.max,
      footTraffic,
      business.customerSatisfaction || 50,
      business.currentStock || 0
    )
    
    // Total pour la période
    const totalSales = Math.min(hourlySales * hours, business.currentStock || 0)
    
    // Revenus et coûts
    const revenue = totalSales * Number(business.productPrice)
    const productionCost = totalSales * (Number(business.productionCost) || economics.baseProductionCost)
    
    return {
      sales: totalSales,
      revenue,
      productionCost,
      profit: revenue - productionCost,
      stockConsumed: totalSales,
    }
  }

  // Mettre à jour l'économie d'une entreprise (à appeler régulièrement)
  static async updateBusinessEconomy(businessId: string): Promise<void> {
    const business = await db.business.findUnique({
      where: { id: businessId },
      include: { location: true }
    })

    if (!business || !business.subType || !business.pricePositioning) return

    const now = new Date()
    const lastCalc = business.lastRevenueCalc || business.createdAt
    const hoursSinceLastCalc = (now.getTime() - lastCalc.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLastCalc < 0.1) return // Minimum 6 minutes entre calculs

    // Calculer les nouveaux revenus
    const result = this.calculateRevenue(business, hoursSinceLastCalc)

    // Calculer les nouveaux indicateurs de prix
    const optimalPrices = this.calculateOptimalPrices(business.subType, business.pricePositioning)
    const demandScore = this.calculateDemandScore(
      Number(business.productPrice),
      optimalPrices.min,
      optimalPrices.max,
      BUSINESS_ECONOMICS[business.subType].priceElasticity
    )
    const priceIndicator = this.getPriceIndicator(
      Number(business.productPrice),
      optimalPrices.min,
      optimalPrices.max
    )

    // Mettre à jour la base de données
    await db.business.update({
      where: { id: businessId },
      data: {
        currentStock: Math.max(0, (business.currentStock || 0) - result.stockConsumed),
        totalSold: (business.totalSold || 0) + result.sales,
        accumulatedRevenue: Number(business.accumulatedRevenue) + result.profit,
        lastRevenueCalc: now,
        demandScore,
        priceIndicator,
        optimalPriceMin: optimalPrices.min,
        optimalPriceMax: optimalPrices.max,
        productionCost: optimalPrices.productionCost,
      }
    })
  }

  // Initialiser une nouvelle entreprise avec des valeurs par défaut
  static async initializeBusiness(businessId: string): Promise<void> {
    const business = await db.business.findUnique({
      where: { id: businessId },
      include: { location: true }
    })

    if (!business || !business.subType || !business.pricePositioning) return

    const optimalPrices = this.calculateOptimalPrices(business.subType, business.pricePositioning)

    await db.business.update({
      where: { id: businessId },
      data: {
        productPrice: optimalPrices.recommended,
        productionCost: optimalPrices.productionCost,
        optimalPriceMin: optimalPrices.min,
        optimalPriceMax: optimalPrices.max,
        currentStock: 0,
        demandScore: 50,
        priceIndicator: PriceIndicator.GOOD,
      }
    })
  }
}

export { BUSINESS_ECONOMICS, PRICE_MULTIPLIERS }
