// ============================================
// app/actions/production.ts
// Server Actions pour production, inventaire et contrats
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { toCentimes, toOrbe } from '@/lib/currency'
import type { ActionResult } from '@/types'
import type { ContractStatus } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface CreateProductionLineData {
  outputResourceId: string
  outputQuantityPerCycle: number
  cycleHours: number
  costPerCycle: number
}

export interface CreateContractData {
  clientId: string
  resourceTypeId: string
  quantityPerDelivery: number
  pricePerUnit: number
  frequencyHours: number
}

export interface ProductionLineWithResource {
  id: string
  outputResource: { id: string; name: string; unit: string }
  outputQuantityPerCycle: number
  cycleHours: number
  costPerCycle: bigint
  active: boolean
  lastCycleAt: Date | null
  nextCycleAt: Date | null
}

export interface InventoryItem {
  id: string
  resourceType: { id: string; name: string; unit: string; basePrice: bigint }
  quantity: number
  averageCostPrice: bigint
  totalValue: bigint
}

export interface ContractWithDetails {
  id: string
  provider: { id: string; name: string }
  client: { id: string; name: string }
  resourceType: { id: string; name: string; unit: string }
  quantityPerDelivery: number
  pricePerUnit: bigint
  frequencyHours: number
  status: ContractStatus
  nextDeliveryAt: Date | null
  deliveries: { id: string; quantityDelivered: number; totalPaid: bigint; deliveredAt: Date; success: boolean }[]
}

// ============================================
// PRODUCTION LINES
// ============================================

export async function createProductionLine(
  userId: string,
  companyId: string,
  data: CreateProductionLineData
): Promise<ActionResult<{ lineId: string }>> {
  try {
    // Vérifier ownership
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    })
    
    if (!company || company.ownerId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    // Validation
    if (data.outputQuantityPerCycle < 1 || data.outputQuantityPerCycle > 1000) {
      return { success: false, error: 'Quantité invalide (1-1000)' }
    }
    
    if (data.cycleHours < 1 || data.cycleHours > 168) {
      return { success: false, error: 'Cycle invalide (1-168 heures)' }
    }
    
    const costPerCycle = toCentimes(data.costPerCycle)
    if (costPerCycle < BigInt(0)) {
      return { success: false, error: 'Coût invalide' }
    }
    
    // Calculer le prochain cycle
    const nextCycleAt = new Date(Date.now() + data.cycleHours * 60 * 60 * 1000)
    
    const line = await prisma.productionLine.create({
      data: {
        companyId,
        outputResourceId: data.outputResourceId,
        outputQuantityPerCycle: data.outputQuantityPerCycle,
        cycleHours: data.cycleHours,
        costPerCycle,
        active: true,
        nextCycleAt,
      },
    })
    
    revalidatePath(`/company/${companyId}`)
    
    return { success: true, data: { lineId: line.id } }
  } catch (error: any) {
    console.error('Create production line error:', error)
    return { success: false, error: error.message }
  }
}

export async function toggleProductionLine(
  userId: string,
  lineId: string
): Promise<ActionResult> {
  try {
    const line = await prisma.productionLine.findUnique({
      where: { id: lineId },
      include: { company: true },
    })
    
    if (!line || line.company.ownerId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    await prisma.productionLine.update({
      where: { id: lineId },
      data: {
        active: !line.active,
        ...(line.active ? {} : { nextCycleAt: new Date(Date.now() + line.cycleHours * 60 * 60 * 1000) }),
      },
    })
    
    revalidatePath(`/company/${line.companyId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function runProductionCycle(lineId: string): Promise<ActionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const line = await tx.productionLine.findUnique({
        where: { id: lineId },
        include: { company: { include: { capitalAccount: true } } },
      })
      
      if (!line || !line.active) {
        throw new Error('Ligne inactive ou introuvable')
      }
      
      // Vérifier que le cycle est dû
      const now = new Date()
      if (line.nextCycleAt && line.nextCycleAt > now) {
        throw new Error('Cycle pas encore dû')
      }
      
      // Vérifier le solde
      const companyAccount = line.company.capitalAccount
      if (companyAccount.balance < line.costPerCycle) {
        // Désactiver la ligne si pas assez de fonds
        await tx.productionLine.update({
          where: { id: lineId },
          data: { active: false },
        })
        throw new Error('Fonds insuffisants - ligne désactivée')
      }
      
      // Débiter le compte
      await tx.bankAccount.update({
        where: { id: companyAccount.id },
        data: { balance: { decrement: line.costPerCycle } },
      })
      
      // Ajouter à l'inventaire
      const existingInventory = await tx.companyInventory.findUnique({
        where: {
          companyId_resourceTypeId: {
            companyId: line.companyId,
            resourceTypeId: line.outputResourceId,
          },
        },
      })
      
      if (existingInventory) {
        // Calculer le nouveau prix moyen
        const oldValue = BigInt(existingInventory.quantity) * existingInventory.averageCostPrice
        const newValue = BigInt(line.outputQuantityPerCycle) * line.costPerCycle / BigInt(line.outputQuantityPerCycle)
        const totalQuantity = existingInventory.quantity + line.outputQuantityPerCycle
        const newAveragePrice = (oldValue + newValue) / BigInt(totalQuantity)
        
        await tx.companyInventory.update({
          where: { id: existingInventory.id },
          data: {
            quantity: { increment: line.outputQuantityPerCycle },
            averageCostPrice: newAveragePrice,
          },
        })
      } else {
        await tx.companyInventory.create({
          data: {
            companyId: line.companyId,
            resourceTypeId: line.outputResourceId,
            quantity: line.outputQuantityPerCycle,
            averageCostPrice: line.costPerCycle / BigInt(line.outputQuantityPerCycle),
          },
        })
      }
      
      // Mettre à jour la ligne de production
      const nextCycleAt = new Date(Date.now() + line.cycleHours * 60 * 60 * 1000)
      await tx.productionLine.update({
        where: { id: lineId },
        data: {
          lastCycleAt: now,
          nextCycleAt,
        },
      })
      
      return {
        produced: line.outputQuantityPerCycle,
        cost: line.costPerCycle,
        nextCycleAt,
      }
    })
    
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Production cycle error:', error)
    return { success: false, error: error.message }
  }
}

export async function getProductionLines(companyId: string): Promise<ActionResult<ProductionLineWithResource[]>> {
  try {
    const lines = await prisma.productionLine.findMany({
      where: { companyId },
      include: { outputResource: true },
      orderBy: { createdAt: 'desc' },
    })
    
    return { success: true, data: lines }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

// ============================================
// INVENTAIRE
// ============================================

export async function getCompanyInventory(companyId: string): Promise<ActionResult<InventoryItem[]>> {
  try {
    const inventory = await prisma.companyInventory.findMany({
      where: { companyId },
      include: { resourceType: true },
      orderBy: { quantity: 'desc' },
    })
    
    const formatted = inventory.map(item => ({
      ...item,
      totalValue: BigInt(item.quantity) * item.resourceType.basePrice,
    }))
    
    return { success: true, data: formatted }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

// ============================================
// CONTRATS
// ============================================

export async function proposeContract(
  userId: string,
  data: CreateContractData
): Promise<ActionResult<{ contractId: string }>> {
  try {
    // Vérifier que le provider est le propriétaire
    const providerCompany = await prisma.company.findUnique({
      where: { id: data.clientId }, // data.clientId is actually the PROVIDER in the request
      select: { ownerId: true },
    })
    
    if (!providerCompany || providerCompany.ownerId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    // Validation
    if (data.quantityPerDelivery < 1) {
      return { success: false, error: 'Quantité invalide' }
    }
    
    const pricePerUnit = toCentimes(data.pricePerUnit)
    if (pricePerUnit < BigInt(1)) {
      return { success: false, error: 'Prix minimum: ◎ 0,01' }
    }
    
    if (data.frequencyHours < 1 || data.frequencyHours > 168) {
      return { success: false, error: 'Fréquence invalide (1-168 heures)' }
    }
    
    const nextDeliveryAt = new Date(Date.now() + data.frequencyHours * 60 * 60 * 1000)
    
    const contract = await prisma.contract.create({
      data: {
        providerId: data.clientId, // Actually the provider
        clientId: data.clientId, // This needs fixing - need separate clientId
        resourceTypeId: data.resourceTypeId,
        quantityPerDelivery: data.quantityPerDelivery,
        pricePerUnit,
        frequencyHours: data.frequencyHours,
        nextDeliveryAt,
      },
    })
    
    revalidatePath('/market')
    
    return { success: true, data: { contractId: contract.id } }
  } catch (error: any) {
    console.error('Propose contract error:', error)
    return { success: false, error: error.message }
  }
}

export async function respondToContract(
  userId: string,
  contractId: string,
  accept: boolean
): Promise<ActionResult> {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { client: true },
    })
    
    if (!contract) {
      return { success: false, error: 'Contrat introuvable' }
    }
    
    // Vérifier que le client répond
    if (contract.client.ownerId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    if (contract.status !== 'ACTIVE') {
      return { success: false, error: 'Contrat déjà traité' }
    }
    
    if (!accept) {
      await prisma.contract.update({
        where: { id: contractId },
        data: { status: 'TERMINATED', terminatedAt: new Date() },
      })
      
      return { success: true }
    }
    
    // Le contrat est déjà créé comme ACTIVE, donc juste confirmation
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function terminateContract(
  userId: string,
  contractId: string
): Promise<ActionResult> {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { provider: true, client: true },
    })
    
    if (!contract) {
      return { success: false, error: 'Contrat introuvable' }
    }
    
    // Soit le provider soit le client peut résilier
    if (contract.provider.ownerId !== userId && contract.client.ownerId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'TERMINATED',
        terminatedAt: new Date(),
      },
    })
    
    revalidatePath('/company')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function runContractDelivery(contractId: string): Promise<ActionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findUnique({
        where: { id: contractId },
        include: {
          provider: { include: { capitalAccount: true } },
          client: { include: { capitalAccount: true } },
          resourceType: true,
        },
      })
      
      if (!contract || contract.status !== 'ACTIVE') {
        throw new Error('Contrat inactif')
      }
      
      // Vérifier que la livraison est dûe
      const now = new Date()
      if (contract.nextDeliveryAt && contract.nextDeliveryAt > now) {
        throw new Error('Livraison pas encore dûe')
      }
      
      const totalAmount = contract.pricePerUnit * BigInt(contract.quantityPerDelivery)
      
      // Vérifier le stock du provider
      const providerInventory = await tx.companyInventory.findUnique({
        where: {
          companyId_resourceTypeId: {
            companyId: contract.providerId,
            resourceTypeId: contract.resourceTypeId,
          },
        },
      })
      
      if (!providerInventory || providerInventory.quantity < contract.quantityPerDelivery) {
        // Échec - stock insuffisant
        await tx.contractDelivery.create({
          data: {
            contractId,
            quantityDelivered: 0,
            totalPaid: BigInt(0),
            success: false,
            failureReason: 'Stock insuffisant',
          },
        })
        
        return { success: false, reason: 'Stock insuffisant' }
      }
      
      // Vérifier le solde du client
      const clientAccount = contract.client.capitalAccount
      if (clientAccount.balance < totalAmount) {
        // Échec - fonds insuffisants
        await tx.contractDelivery.create({
          data: {
            contractId,
            quantityDelivered: 0,
            totalPaid: BigInt(0),
            success: false,
            failureReason: 'Fonds client insuffisants',
          },
        })
        
        return { success: false, reason: 'Fonds insuffisants' }
      }
      
      // Effectuer la transaction
      // 1. Déduire le stock du provider
      await tx.companyInventory.update({
        where: { id: providerInventory.id },
        data: { quantity: { decrement: contract.quantityPerDelivery } },
      })
      
      // 2. Créditer le compte du provider
      await tx.bankAccount.update({
        where: { id: contract.provider.capitalAccountId },
        data: { balance: { increment: totalAmount } },
      })
      
      // 3. Débiter le compte du client
      await tx.bankAccount.update({
        where: { id: clientAccount.id },
        data: { balance: { decrement: totalAmount } },
      })
      
      // 4. Ajouter au stock du client
      const clientInventory = await tx.companyInventory.findUnique({
        where: {
          companyId_resourceTypeId: {
            companyId: contract.clientId,
            resourceTypeId: contract.resourceTypeId,
          },
        },
      })
      
      if (clientInventory) {
        const oldValue = BigInt(clientInventory.quantity) * clientInventory.averageCostPrice
        const newValue = BigInt(contract.quantityPerDelivery) * contract.pricePerUnit
        const totalQty = clientInventory.quantity + contract.quantityPerDelivery
        const newAveragePrice = (oldValue + newValue) / BigInt(totalQty)
        
        await tx.companyInventory.update({
          where: { id: clientInventory.id },
          data: {
            quantity: { increment: contract.quantityPerDelivery },
            averageCostPrice: newAveragePrice,
          },
        })
      } else {
        await tx.companyInventory.create({
          data: {
            companyId: contract.clientId,
            resourceTypeId: contract.resourceTypeId,
            quantity: contract.quantityPerDelivery,
            averageCostPrice: contract.pricePerUnit,
          },
        })
      }
      
      // Calculer le montant total à payer
      const totalPaid = BigInt(contract.quantityPerDelivery) * contract.pricePerUnit
      
      // 5. Logger la livraison
      await tx.contractDelivery.create({
        data: {
          contractId,
          quantityDelivered: contract.quantityPerDelivery,
          totalPaid,
          success: true,
        },
      })
      
      // 6. Planifier la prochaine livraison
      const nextDeliveryAt = new Date(Date.now() + contract.frequencyHours * 60 * 60 * 1000)
      await tx.contract.update({
        where: { id: contractId },
        data: { nextDeliveryAt },
      })
      
      return { success: true, delivered: contract.quantityPerDelivery, totalPaid }
    })
    
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Contract delivery error:', error)
    return { success: false, error: error.message }
  }
}

export async function getCompanyContracts(
  companyId: string,
  asProvider: boolean = true
): Promise<ActionResult<ContractWithDetails[]>> {
  try {
    const field = asProvider ? 'providerId' : 'clientId'
    
    const contracts = await prisma.contract.findMany({
      where: {
        [field]: companyId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      include: {
        provider: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        resourceType: true,
        deliveries: {
          orderBy: { deliveredAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { startedAt: 'desc' },
    })
    
    return { success: true, data: contracts }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

export async function getResourceTypes(): Promise<ActionResult<{ id: string; name: string; category: string; basePrice: bigint; unit: string }[]>> {
  try {
    const types = await prisma.resourceType.findMany({
      orderBy: { name: 'asc' },
    })
    
    return { success: true, data: types }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
