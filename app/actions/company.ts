// ============================================
// app/actions/company.ts
// Server Actions pour la gestion des entreprises
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { toCentimes } from '@/lib/currency'
import type { ActionResult, CompanyFormData } from '@/types'
import type { AccountOwnerType } from '@prisma/client'

/**
 * Données pour créer une entreprise
 */
export interface CreateCompanyData {
  name: string
  objective: string
  description: string
  locationId: string
  initialCapital: number // en Orbe (décimal)
}

/**
 * Crée une entreprise avec transaction atomique :
 * - Débite le compte personnel
 * - Crée le compte bancaire entreprise
 * - Crée l'entreprise
 */
export async function createCompany(
  userId: string,
  data: CreateCompanyData
): Promise<ActionResult<{ companyId: string }>> {
  const capitalInCentimes = toCentimes(data.initialCapital)
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérifier le solde du compte personnel
      const personalAccount = await tx.bankAccount.findFirst({
        where: {
          ownerId: userId,
          ownerType: 'PERSONAL' as AccountOwnerType,
        },
      })
      
      if (!personalAccount) {
        throw new Error('Compte personnel introuvable')
      }
      
      if (personalAccount.balance < capitalInCentimes) {
        throw new Error('Solde insuffisant pour créer cette entreprise')
      }
      
      // 2. Débiter le compte personnel
      await tx.bankAccount.update({
        where: { id: personalAccount.id },
        data: { balance: { decrement: capitalInCentimes } },
      })
      
      // 3. Créer le compte bancaire de l'entreprise
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let accountNumber = 'ORB-'
      for (let i = 0; i < 4; i++) {
        accountNumber += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      accountNumber += '-'
      for (let i = 0; i < 4; i++) {
        accountNumber += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      
      const companyAccount = await tx.bankAccount.create({
        data: {
          ownerId: userId,
          ownerType: 'COMPANY' as AccountOwnerType,
          balance: capitalInCentimes,
          accountNumber,
        },
      })
      
      // 4. Créer l'entreprise
      const company = await tx.company.create({
        data: {
          ownerId: userId,
          name: data.name,
          objective: data.objective,
          description: data.description,
          locationId: data.locationId,
          capitalAccountId: companyAccount.id,
        },
      })
      
      // 5. Créer la transaction de capital initial
      await tx.transaction.create({
        data: {
          fromAccountId: personalAccount.id,
          toAccountId: companyAccount.id,
          amount: capitalInCentimes,
          label: `Capital initial - ${data.name}`,
        },
      })
      
      return company
    })
    
    revalidatePath('/dashboard')
    revalidatePath('/map')
    
    return { success: true, data: { companyId: result.id } }
  } catch (error: any) {
    console.error('Create company error:', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de la création de l\'entreprise',
    }
  }
}

/**
 * Récupère une entreprise par son ID avec toutes ses relations
 */
export async function getCompanyById(id: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true },
        },
        capitalAccount: {
          include: {
            sentTransactions: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: {
                toAccount: { select: { accountNumber: true } },
              },
            },
            receivedTransactions: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: {
                fromAccount: { select: { accountNumber: true } },
              },
            },
          },
        },
        location: true,
      },
    })
    
    if (!company) {
      return { success: false, error: 'Entreprise introuvable' }
    }
    
    return { success: true, company }
  } catch (error) {
    console.error('Get company error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Met à jour une entreprise (vérification ownership)
 */
export async function updateCompany(
  userId: string,
  companyId: string,
  data: Partial<{ name: string; objective: string; description: string }>
): Promise<ActionResult> {
  try {
    // Vérifier ownership
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    })
    
    if (!company || company.ownerId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    await prisma.company.update({
      where: { id: companyId },
      data,
    })
    
    revalidatePath(`/company/${companyId}`)
    return { success: true }
  } catch (error) {
    console.error('Update company error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Récupère toutes les entreprises pour la carte (données légères)
 */
export async function getAllCompaniesOnMap() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        objective: true,
        locationId: true,
        owner: {
          select: { username: true, displayName: true },
        },
      },
    })
    
    return { success: true, companies }
  } catch (error) {
    console.error('Get companies map error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère les entreprises d'un utilisateur
 */
export async function getUserCompanies(userId: string) {
  try {
    const companies = await prisma.company.findMany({
      where: { ownerId: userId },
      include: {
        capitalAccount: { select: { balance: true } },
        location: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return { success: true, companies }
  } catch (error) {
    console.error('Get user companies error:', error)
    return { success: false, error: 'Erreur' }
  }
}
