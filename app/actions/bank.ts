'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getUserAccounts(userId: string) {
  try {
    const accounts = await prisma.bankAccount.findMany({
      where: { ownerId: userId },
      include: {
        capitalCompany: true,
        sentTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            fromAccount: {
              include: {
                capitalCompany: true,
              },
            },
            toAccount: {
              include: {
                capitalCompany: true,
              },
            },
          },
        },
        receivedTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            fromAccount: {
              include: {
                capitalCompany: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return { accounts }
  } catch (error) {
    console.error('Get user accounts error:', error)
    return { error: 'Erreur lors de la récupération des comptes' }
  }
}

export async function getAccountTransactions(accountId: string, page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [
            { fromAccountId: accountId },
            { toAccountId: accountId },
          ],
        },
        include: {
          fromAccount: {
            include: {
              capitalCompany: true,
            },
          },
          toAccount: {
            include: {
              capitalCompany: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { fromAccountId: accountId },
            { toAccountId: accountId },
          ],
        },
      }),
    ])

    return {
      transactions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    }
  } catch (error) {
    console.error('Get account transactions error:', error)
    return { error: 'Erreur lors de la récupération des transactions' }
  }
}

export async function transferFunds(
  fromAccountId: string,
  toAccountNumber: string,
  amount: bigint,
  label: string | null,
  userId: string
) {
  try {
    // Verify from account belongs to user
    const fromAccount = await prisma.bankAccount.findFirst({
      where: {
        id: fromAccountId,
        ownerId: userId,
      },
    })

    if (!fromAccount) {
      return { error: 'Compte source non trouvé' }
    }

    // Find destination account
    const toAccount = await prisma.bankAccount.findUnique({
      where: { accountNumber: toAccountNumber },
    })

    if (!toAccount) {
      return { error: 'Numéro de compte destinataire non trouvé' }
    }

    if (fromAccount.id === toAccount.id) {
      return { error: 'Impossible de transférer vers le même compte' }
    }

    // Check balance
    if (fromAccount.balance < amount) {
      return { error: 'Solde insuffisant' }
    }

    // Execute transfer
    await prisma.$transaction(async (tx) => {
      // Deduct from source
      await tx.bankAccount.update({
        where: { id: fromAccount.id },
        data: { balance: { decrement: amount } },
      })

      // Add to destination
      await tx.bankAccount.update({
        where: { id: toAccount.id },
        data: { balance: { increment: amount } },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount,
          label,
        },
      })

      // Update user total balance if personal account
      if (fromAccount.ownerType === 'PERSONAL') {
        await tx.gameProfile.update({
          where: { userId: fromAccount.ownerId },
          data: { totalBalance: { decrement: amount } },
        })
      }

      // Update recipient total balance if personal account
      if (toAccount.ownerType === 'PERSONAL') {
        await tx.gameProfile.update({
          where: { userId: toAccount.ownerId },
          data: { totalBalance: { increment: amount } },
        })
      }
    })

    revalidatePath('/bank')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Transfer funds error:', error)
    return { error: 'Erreur lors du transfert' }
  }
}

export async function getTotalBalance(userId: string) {
  try {
    const profile = await prisma.gameProfile.findUnique({
      where: { userId },
    })

    return { totalBalance: profile?.totalBalance ?? 0n }
  } catch (error) {
    console.error('Get total balance error:', error)
    return { error: 'Erreur lors de la récupération du solde' }
  }
}
