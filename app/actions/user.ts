'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function updateDisplayName(userId: string, newName: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé' }
    }

    if (user.displayNameChanged) {
      return { error: 'Le nom d\'affichage ne peut être modifié qu\'une seule fois' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: newName,
        displayNameChanged: true,
      },
    })

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Update display name error:', error)
    return { error: 'Erreur lors de la mise à jour du nom' }
  }
}

export async function updateEmail(userId: string, newEmail: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) {
      return { error: error.message }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    })

    return { success: true }
  } catch (error) {
    console.error('Update email error:', error)
    return { error: 'Erreur lors de la mise à jour de l\'email' }
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Update password error:', error)
    return { error: 'Erreur lors de la mise à jour du mot de passe' }
  }
}

export async function getUserStats(userId: string) {
  try {
    const [profile, companiesCount, suggestionsCount] = await Promise.all([
      prisma.gameProfile.findUnique({
        where: { userId },
      }),
      prisma.company.count({
        where: { ownerId: userId },
      }),
      prisma.suggestion.count({
        where: { authorId: userId },
      }),
    ])

    return {
      totalBalance: profile?.totalBalance ?? 0n,
      companiesCount,
      suggestionsCount,
    }
  } catch (error) {
    console.error('Get user stats error:', error)
    return { error: 'Erreur lors de la récupération des statistiques' }
  }
}
