'use server'

import { revalidatePath } from 'next/cache'
import { prisma, type PrismaTransaction } from '@/lib/prisma'

const MINIMUM_COMPANY_CAPITAL = 50000n // ◎ 500,00 en centimes

function generateAccountNumber(): string {
  // Format: ORB-XXXX-XXXX (plus robuste et lisible)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'ORB-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  result += '-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createCompany(
  userId: string,
  data: {
    name: string
    objective: string
    description: string
    capital: bigint
  }
) {
  try {
    // Validate minimum capital
    if (data.capital < MINIMUM_COMPANY_CAPITAL) {
      return { error: `Capital minimum requis: ◎ 500,00` }
    }

    // Get user's personal account
    const personalAccount = await prisma.bankAccount.findFirst({
      where: {
        ownerId: userId,
        ownerType: 'PERSONAL',
      },
    })

    if (!personalAccount) {
      return { error: 'Compte personnel non trouvé' }
    }

    // Check if user has enough funds
    if (personalAccount.balance < data.capital) {
      return { error: 'Solde insuffisant pour créer l\'entreprise' }
    }

    // Get user's home location
    const userProfile = await prisma.gameProfile.findUnique({
      where: { userId },
    })

    if (!userProfile) {
      return { error: 'Profil non trouvé' }
    }

    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from personal account
      await tx.bankAccount.update({
        where: { id: personalAccount.id },
        data: { balance: { decrement: data.capital } },
      })

      // Create company bank account
      const companyAccount = await tx.bankAccount.create({
        data: {
          ownerId: userId,
          ownerType: 'COMPANY',
          balance: data.capital,
          accountNumber: generateAccountNumber(),
        },
      })

      // Create company
      const company = await tx.company.create({
        data: {
          ownerId: userId,
          name: data.name,
          objective: data.objective,
          description: data.description,
          locationId: userProfile.homeLocationId,
          capitalAccountId: companyAccount.id,
        },
      })

      // Update company account with companyId
      await tx.bankAccount.update({
        where: { id: companyAccount.id },
        data: { companyId: company.id },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          fromAccountId: personalAccount.id,
          toAccountId: companyAccount.id,
          amount: data.capital,
          label: `Capital initial - ${data.name}`,
        },
      })

      // Update user total balance
      await tx.gameProfile.update({
        where: { userId },
        data: { totalBalance: { decrement: data.capital } },
      })

      return company
    })

    revalidatePath('/dashboard')
    revalidatePath('/bank')
    revalidatePath('/map')

    return { success: true, companyId: result.id }
  } catch (error) {
    console.error('Create company error:', error)
    return { error: 'Erreur lors de la création de l\'entreprise' }
  }
}

export async function getUserCompanies(userId: string) {
  try {
    const companies = await prisma.company.findMany({
      where: { ownerId: userId },
      include: {
        capitalAccount: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { companies }
  } catch (error) {
    console.error('Get user companies error:', error)
    return { error: 'Erreur lors de la récupération des entreprises' }
  }
}

export async function getCompanyById(companyId: string, userId: string) {
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        ownerId: userId,
      },
      include: {
        capitalAccount: true,
        location: true,
        owner: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    })

    if (!company) {
      return { error: 'Entreprise non trouvée' }
    }

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccountId: company.capitalAccountId },
          { toAccountId: company.capitalAccountId },
        ],
      },
      include: {
        fromAccount: true,
        toAccount: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return { company, transactions }
  } catch (error) {
    console.error('Get company error:', error)
    return { error: 'Erreur lors de la récupération de l\'entreprise' }
  }
}
