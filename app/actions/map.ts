'use server'

import { prisma } from '@/lib/prisma'

export async function getUnlockedLocations() {
  try {
    const locations = await prisma.mapLocation.findMany({
      where: { unlocked: true },
      orderBy: { requiredUsersToUnlock: 'asc' },
    })

    return { locations }
  } catch (error) {
    console.error('Get unlocked locations error:', error)
    return { error: 'Erreur lors de la récupération des locations' }
  }
}

export async function getAllLocations() {
  try {
    const locations = await prisma.mapLocation.findMany({
      orderBy: { requiredUsersToUnlock: 'asc' },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            objective: true,
          },
        },
      },
    })

    const totalUsers = await prisma.user.count()

    return { locations, totalUsers }
  } catch (error) {
    console.error('Get all locations error:', error)
    return { error: 'Erreur lors de la récupération des locations' }
  }
}
