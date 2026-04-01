'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isAdmin } from './admin'

const ADMIN_ACCOUNT_NUMBER = 'ORB-ADMIN-0001'
const COMPANY_CREATION_COST = 50000n // ◎ 500,00 en centimes

export async function closeCompany(
  userId: string,
  companyId: string,
  hasStockMarket: boolean = false
) {
  const isUserAdmin = await isAdmin(userId)
  
  try {
    const company = await prisma.company.findFirst({
      where: { 
        id: companyId,
        // Si admin, peut fermer n'importe quelle entreprise
        // Sinon, seulement ses propres entreprises
        ...(isUserAdmin ? {} : { ownerId: userId })
      },
      include: {
        capitalAccount: true,
        owner: true,
      },
    })

    if (!company) {
      return { error: 'Entreprise non trouvée' }
    }

    const balance = company.capitalAccount?.balance || 0n

    // Exécuter la liquidation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Si système de bourse activé et actionnaires existent
      //    verser les parts aux actionnaires (placeholder pour le futur)
      let remainingBalance = balance

      if (hasStockMarket) {
        // TODO: Calculer parts actionnaires et les verser
        // remainingBalance -= shareholderPayouts
      }

      // 2. Transférer le reste vers la banque internationale (admin)
      if (remainingBalance > 0n) {
        // Trouver ou créer le compte admin
        let adminAccount = await tx.bankAccount.findFirst({
          where: { accountNumber: ADMIN_ACCOUNT_NUMBER },
        })

        if (!adminAccount) {
          // Fallback: chercher par ownerId admin
          const adminId = process.env.ADMIN_USER_ID
          if (adminId) {
            adminAccount = await tx.bankAccount.findFirst({
              where: { ownerId: adminId, ownerType: 'PERSONAL' },
            })
          }
        }

        if (adminAccount) {
          // Créditer la banque internationale
          await tx.bankAccount.update({
            where: { id: adminAccount.id },
            data: { balance: { increment: remainingBalance } },
          })

          // Enregistrer la transaction
          await tx.transaction.create({
            data: {
              fromAccountId: company.capitalAccountId,
              toAccountId: adminAccount.id,
              amount: remainingBalance,
              label: `Liquidation - ${company.name}`,
            },
          })
        }
      }

      // 3. Débiter le solde du compte entreprise (mise à 0)
      await tx.bankAccount.update({
        where: { id: company.capitalAccountId },
        data: { balance: 0n },
      })

      // 4. Marquer l'entreprise comme fermée (archivage soft)
      // Pour l'instant on la supprime, mais on pourrait ajouter un champ `closedAt`
      await tx.company.delete({
        where: { id: companyId },
      })

      // 5. Supprimer le compte bancaire entreprise
      await tx.bankAccount.delete({
        where: { id: company.capitalAccountId },
      })

      return { success: true, liquidatedAmount: remainingBalance }
    })

    revalidatePath('/bank')
    revalidatePath('/dashboard')
    revalidatePath('/admin/economy')

    return result
  } catch (error) {
    console.error('Close company error:', error)
    return { error: 'Erreur lors de la liquidation' }
  }
}

export async function getCompanyClosureData(userId: string, companyId: string) {
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        ownerId: userId,
      },
      include: {
        capitalAccount: true,
        location: true,
      },
    })

    if (!company) {
      return { error: 'Entreprise non trouvée' }
    }

    return {
      company: {
        id: company.id,
        name: company.name,
        balance: company.capitalAccount?.balance || 0n,
        location: company.location?.name,
      },
    }
  } catch (error) {
    console.error('Get company closure data error:', error)
    return { error: 'Erreur' }
  }
}
