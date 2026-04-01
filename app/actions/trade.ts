// ============================================
// app/actions/trade.ts
// Server Actions pour routes commerciales
// ============================================

'use server'

import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'
import type { TradeRoute, TradeRouteUsage } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface TradeRouteWithLocations extends TradeRoute {
  fromLocation: { id: string; name: string; lat: number; lng: number }
  toLocation: { id: string; name: string; lat: number; lng: number }
  _count?: { usages: number }
}

// ============================================
// ROUTES COMMERCIALES
// ============================================

/**
 * Vérifie si une route commerciale existe entre deux villes
 */
export async function checkTradeRoute(
  fromLocationId: string,
  toLocationId: string
): Promise<ActionResult<{ exists: boolean; route?: TradeRoute }>> {
  try {
    const route = await prisma.tradeRoute.findUnique({
      where: {
        fromLocationId_toLocationId: {
          fromLocationId,
          toLocationId,
        },
      },
    })
    
    return { 
      success: true, 
      data: { 
        exists: !!route && route.active,
        route: route || undefined,
      }
    }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère toutes les routes commerciales actives
 */
export async function getTradeRoutes(): Promise<ActionResult<TradeRouteWithLocations[]>> {
  try {
    const routes = await prisma.tradeRoute.findMany({
      where: { active: true },
      include: {
        fromLocation: { select: { id: true, name: true, lat: true, lng: true } },
        toLocation: { select: { id: true, name: true, lat: true, lng: true } },
        _count: { select: { usages: true } },
      },
    })
    
    return { success: true, data: routes }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère les routes d'une ville spécifique
 */
export async function getTradeRoutesForLocation(locationId: string): Promise<ActionResult<TradeRouteWithLocations[]>> {
  try {
    const routes = await prisma.tradeRoute.findMany({
      where: {
        active: true,
        OR: [
          { fromLocationId: locationId },
          { toLocationId: locationId },
        ],
      },
      include: {
        fromLocation: { select: { id: true, name: true, lat: true, lng: true } },
        toLocation: { select: { id: true, name: true, lat: true, lng: true } },
        _count: { select: { usages: true } },
      },
    })
    
    return { success: true, data: routes }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Crée une route commerciale (admin seulement)
 */
export async function createTradeRoute(
  fromLocationId: string,
  toLocationId: string,
  distance: number,
  transitTimeMins: number
): Promise<ActionResult<{ routeId: string }>> {
  try {
    if (fromLocationId === toLocationId) {
      return { success: false, error: 'Une ville ne peut pas avoir de route vers elle-même' }
    }
    
    const route = await prisma.tradeRoute.create({
      data: {
        fromLocationId,
        toLocationId,
        distance,
        transitTimeMins,
        active: true,
      },
    })
    
    return { success: true, data: { routeId: route.id } }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Une route existe déjà entre ces deux villes' }
    }
    return { success: false, error: error.message }
  }
}

/**
 * Log l'usage d'une route commerciale
 */
export async function logTradeRouteUsage(
  routeId: string,
  contractId: string
): Promise<ActionResult<{ usageId: string }>> {
  try {
    const usage = await prisma.tradeRouteUsage.create({
      data: {
        routeId,
        contractId,
        departedAt: new Date(),
      },
    })
    
    return { success: true, data: { usageId: usage.id } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Marque une livraison comme arrivée
 */
export async function markDeliveryArrived(usageId: string): Promise<ActionResult> {
  try {
    await prisma.tradeRouteUsage.update({
      where: { id: usageId },
      data: { arrivedAt: new Date() },
    })
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Récupère les usages d'une route
 */
export async function getRouteUsages(routeId: string): Promise<ActionResult<TradeRouteUsage[]>> {
  try {
    const usages = await prisma.tradeRouteUsage.findMany({
      where: { routeId },
      orderBy: { departedAt: 'desc' },
      take: 100,
    })
    
    return { success: true, data: usages }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
