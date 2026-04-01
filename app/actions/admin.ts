'use server'

import { prisma } from '@/lib/prisma'

// Admin user ID - à remplacer par ton user ID une fois connecté
const ADMIN_USER_ID = process.env.ADMIN_USER_ID

export async function isAdmin(userId: string): Promise<boolean> {
  return userId === ADMIN_USER_ID
}

export async function getAdminStats() {
  const [
    totalUsers,
    totalCompanies,
    totalBalance,
    totalTransactions,
    pendingSuggestions,
    unlockedLocations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.gameProfile.aggregate({
      _sum: { totalBalance: true },
    }),
    prisma.transaction.count(),
    prisma.suggestion.count({ where: { status: 'PENDING' } }),
    prisma.mapLocation.count({ where: { unlocked: true } }),
  ])

  return {
    totalUsers,
    totalCompanies,
    totalOrbesInCirculation: totalBalance._sum.totalBalance || 0n,
    totalTransactions,
    pendingSuggestions,
    unlockedLocations,
  }
}

export async function getAllSuggestionsForAdmin() {
  const suggestions = await prisma.suggestion.findMany({
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { upvotes: 'desc' }],
  })

  return { suggestions }
}

export async function updateSuggestionStatus(
  adminId: string,
  suggestionId: string,
  status: 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED'
) {
  const isUserAdmin = await isAdmin(adminId)
  if (!isUserAdmin) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status },
    })

    return { success: true }
  } catch (error) {
    console.error('Update suggestion status error:', error)
    return { error: 'Failed to update status' }
  }
}

export async function getAllUsersForAdmin(adminId: string) {
  const isUserAdmin = await isAdmin(adminId)
  if (!isUserAdmin) {
    return { error: 'Unauthorized' }
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      createdAt: true,
      _count: {
        select: {
          companies: true,
          suggestions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return { users }
}

export async function getBankAccountForAdmin(adminId: string) {
  const isUserAdmin = await isAdmin(adminId)
  if (!isUserAdmin) {
    return { error: 'Unauthorized' }
  }

  // Get or create admin's "International Bank" account
  let account = await prisma.bankAccount.findFirst({
    where: {
      ownerId: ADMIN_USER_ID,
      ownerType: 'PERSONAL',
    },
  })

  if (!account) {
    account = await prisma.bankAccount.create({
      data: {
        ownerId: ADMIN_USER_ID!,
        ownerType: 'PERSONAL',
        balance: 0n,
        accountNumber: 'ORB-ADMIN-0001',
      },
    })
  }

  return { account }
}
