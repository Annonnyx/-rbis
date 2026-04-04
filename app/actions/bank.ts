// ============================================
// app/actions/bank.ts
// Server Actions pour la gestion bancaire
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { toCentimes } from '@/lib/currency'
import type { ActionResult, TransferFormData } from '@/types'

const ITEMS_PER_PAGE = 10
const INITIAL_BALANCE = BigInt(100000) // ◎ 1 000,00 en centimes

/**
 * Récupère tous les comptes bancaires d'un utilisateur
 * avec leurs transactions récentes
 */
export async function getUserAccounts(userId: string) {
  console.log(`[getUserAccounts] Starting for userId: ${userId}`)
  try {
    const accounts = await prisma.bankAccount.findMany({
      where: { ownerId: userId },
      include: {
        sentTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            toAccount: {
              select: { accountNumber: true, ownerType: true },
            },
          },
        },
        receivedTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            fromAccount: {
              select: { accountNumber: true, ownerType: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    console.log(`[getUserAccounts] Found ${accounts.length} accounts for userId: ${userId}`)
    accounts.forEach((acc, i) => {
      console.log(`[getUserAccounts] Account ${i}: id=${acc.id}, number=${acc.accountNumber}, sentTx=${acc.sentTransactions.length}, receivedTx=${acc.receivedTransactions.length}`)
    })
    
    return { success: true, accounts }
  } catch (error) {
    console.error('[getUserAccounts] Error:', error)
    return { success: false, error: 'Erreur lors de la récupération des comptes', accounts: [] }
  }
}

/**
 * Récupère l'historique des transactions paginé pour un compte
 */
export async function getTransactionHistory(
  accountId: string,
  page: number = 1
): Promise<ActionResult<{ transactions: any[]; totalPages: number; currentPage: number }>> {
  console.log(`[getTransactionHistory] Starting for accountId: ${accountId}, page: ${page}`)
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE
    
    console.log(`[getTransactionHistory] Querying with skip: ${skip}, take: ${ITEMS_PER_PAGE}`)
    
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
        },
        include: {
          fromAccount: {
            select: { accountNumber: true, ownerType: true, ownerId: true },
          },
          toAccount: {
            select: { accountNumber: true, ownerType: true, ownerId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.transaction.count({
        where: {
          OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
        },
      }),
    ])
    
    console.log(`[getTransactionHistory] Found ${transactions.length} transactions (total: ${totalCount})`)
    transactions.forEach((tx, i) => {
      console.log(`[getTransactionHistory] Tx ${i}: id=${tx.id}, amount=${tx.amount}, from=${tx.fromAccountId}, to=${tx.toAccountId}, date=${tx.createdAt}`)
    })
    
    return {
      success: true,
      data: {
        transactions,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        currentPage: page,
      },
    }
  } catch (error) {
    console.error('[getTransactionHistory] Error:', error)
    return { success: false, error: 'Erreur lors de la récupération de l\'historique' }
  }
}

/**
 * Effectue un virement entre comptes
 * Transaction atomique avec vérifications de solde
 */
export async function transferFunds(data: TransferFormData): Promise<ActionResult> {
  const { fromAccountId, toAccountNumber, amount, label } = data
  
  console.log(`[transferFunds] Starting transfer fromAccountId: ${fromAccountId}, toAccountNumber: ${toAccountNumber}, amount: ${amount}`)
  
  try {
    // Convertir le montant en centimes
    const amountInCentimes = toCentimes(amount)
    console.log(`[transferFunds] Amount in centimes: ${amountInCentimes}`)
    
    // Vérifier que le montant est positif
    if (amountInCentimes <= BigInt(0)) {
      console.log(`[transferFunds] Invalid amount: ${amountInCentimes}`)
      return { success: false, error: 'Le montant doit être supérieur à 0' }
    }
    
    // Transaction Prisma atomique
    const result = await prisma.$transaction(async (tx) => {
      console.log(`[transferFunds] Starting transaction`)
      
      // 1. Récupérer le compte source avec verrou
      const fromAccount = await tx.bankAccount.findUnique({
        where: { id: fromAccountId },
      })
      
      console.log(`[transferFunds] From account found: ${fromAccount ? 'yes' : 'no'}, balance: ${fromAccount?.balance}`)
      
      if (!fromAccount) {
        throw new Error('Compte source introuvable')
      }
      
      // 2. Vérifier le solde suffisant
      if (fromAccount.balance < amountInCentimes) {
        console.log(`[transferFunds] Insufficient balance: ${fromAccount.balance} < ${amountInCentimes}`)
        throw new Error('Solde insuffisant')
      }
      
      // 3. Chercher le compte destinataire par numéro
      const toAccount = await tx.bankAccount.findUnique({
        where: { accountNumber: toAccountNumber },
      })
      
      console.log(`[transferFunds] To account found: ${toAccount ? 'yes' : 'no'}, id: ${toAccount?.id}`)
      
      if (!toAccount) {
        throw new Error('Compte destinataire introuvable')
      }
      
      // 4. Empêcher virement vers le même compte
      if (fromAccount.id === toAccount.id) {
        throw new Error('Impossible de virer vers le même compte')
      }
      
      // 5. Débiter le compte source
      await tx.bankAccount.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amountInCentimes } },
      })
      console.log(`[transferFunds] Debited fromAccount: ${fromAccountId}`)
      
      // 6. Créditer le compte destinataire
      await tx.bankAccount.update({
        where: { id: toAccount.id },
        data: { balance: { increment: amountInCentimes } },
      })
      console.log(`[transferFunds] Credited toAccount: ${toAccount.id}`)
      
      // 7. Créer la transaction (log immuable)
      const transaction = await tx.transaction.create({
        data: {
          fromAccountId,
          toAccountId: toAccount.id,
          amount: amountInCentimes,
          label: label || undefined,
        },
      })
      
      console.log(`[transferFunds] Transaction created: ${transaction.id}`)
      
      return transaction
    })
    
    console.log(`[transferFunds] Transaction completed successfully: ${result.id}`)
    
    // Revalidation des pages concernées
    revalidatePath('/bank')
    revalidatePath('/dashboard')
    
    return { success: true, data: result }
  } catch (error: any) {
    console.error('[transferFunds] Error:', error)
    return { 
      success: false, 
      error: error.message || 'Erreur lors du virement' 
    }
  }
}

/**
 * Récupère un compte par son ID avec le propriétaire
 */
export async function getAccountWithOwner(accountId: string) {
  try {
    const account = await prisma.bankAccount.findUnique({
      where: { id: accountId },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true },
        },
      },
    })
    
    return { success: true, account }
  } catch (error) {
    console.error('Get account error:', error)
    return { success: false, error: 'Erreur' }
  }
}
