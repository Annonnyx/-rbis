'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

const INITIAL_BALANCE = 100000n // 1000 Orbes en centimes (◎ 1 000,00)

function generateAccountNumber(): string {
  // Format: ORB-XXXX-XXXX (plus robuste que Math.random)
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

function generateUsernameFromEmail(email: string): string {
  // Extract local part of email and clean it
  const localPart = email.split('@')[0]
  // Remove special characters, keep only alphanumeric, hyphens, underscores
  let username = localPart.toLowerCase().replace(/[^a-z0-9_-]/g, '')
  // Add random suffix to avoid conflicts
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  username = `${username}_${randomSuffix}`
  // Ensure max 50 chars
  if (username.length > 50) {
    username = username.substring(0, 46) + randomSuffix
  }
  return username
}

export async function createOAuthUser(supabaseUserId: string, email: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUserId }
    })
    
    if (existingUser) {
      return { success: true, user: existingUser, isNewUser: false }
    }

    // Generate unique username from email
    let username = generateUsernameFromEmail(email)
    let attempts = 0
    const maxAttempts = 10

    // Ensure username is unique
    while (attempts < maxAttempts) {
      const existingUsername = await prisma.user.findFirst({
        where: { username }
      })
      if (!existingUsername) break
      
      // Generate new username with different random suffix
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      username = generateUsernameFromEmail(email).replace(/_\d{4}$/, `_${randomSuffix}`)
      attempts++
    }

    if (attempts >= maxAttempts) {
      return { error: 'Could not generate unique username' }
    }

    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        username,
      },
    })

    return { success: true, user, isNewUser: true }
  } catch (error) {
    console.error('OAuth user creation error:', error)
    return { error: 'Failed to create user in database' }
  }
}

export async function registerUser(email: string, password: string, username: string) {
  const supabase = await createClient()

  // Validation côté serveur
  if (!email || !password || !username) {
    return { error: 'Tous les champs sont requis' }
  }

  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères' }
  }

  if (username.length < 1 || username.length > 50) {
    return { error: 'Le nom d\'utilisateur doit contenir entre 1 et 50 caractères' }
  }

  // Vérifier si le username existe déjà (case-sensitive)
  const existingUser = await prisma.user.findFirst({
    where: { username },
  })

  if (existingUser) {
    return { error: 'Ce nom d\'utilisateur est déjà pris' }
  }

  // Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user' }
  }

  try {
    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        username,
      },
    })

    return { success: true, userId: user.id }
  } catch (error) {
    // Log l'erreur mais ne pas exposer de détails sensibles
    console.error('Database error during user creation:', error)
    return { error: 'Erreur lors de la création de l\'utilisateur. Veuillez réessayer.' }
  }
}

export async function completeProfile(userId: string, firstName: string, lastName: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
      },
    })

    return { success: true }
  } catch (error) {
    return { error: 'Failed to update profile' }
  }
}

export async function selectResidence(userId: string, locationId: string) {
  try {
    // Check if location is unlocked
    const location = await prisma.mapLocation.findUnique({
      where: { id: locationId },
    })

    if (!location || !location.unlocked) {
      return { error: 'Location is not available' }
    }

    // Check if user already has a profile
    const existingProfile = await prisma.gameProfile.findUnique({
      where: { userId },
    })

    if (existingProfile) {
      return { error: 'Profile already exists' }
    }

    // Create bank account with initial balance
    const accountNumber = generateAccountNumber()
    const bankAccount = await prisma.bankAccount.create({
      data: {
        ownerId: userId,
        ownerType: 'PERSONAL',
        balance: INITIAL_BALANCE,
        accountNumber,
      },
    })

    // Create game profile
    await prisma.gameProfile.create({
      data: {
        userId,
        homeLocationId: locationId,
        totalBalance: INITIAL_BALANCE,
      },
    })

    // Check for location unlocks
    await checkLocationUnlocks()

    revalidatePath('/map')
    return { success: true }
  } catch (error) {
    console.error('Select residence error:', error)
    return { error: 'Failed to set residence' }
  }
}

export async function checkLocationUnlocks() {
  try {
    const totalUsers = await prisma.user.count()

    // Unlock locations based on user count
    await prisma.mapLocation.updateMany({
      where: {
        unlocked: false,
        requiredUsersToUnlock: {
          lte: totalUsers,
        },
      },
      data: {
        unlocked: true,
      },
    })

    revalidatePath('/map')
    return { success: true }
  } catch (error) {
    console.error('Check location unlocks error:', error)
    return { error: 'Failed to check unlocks' }
  }
}

export async function loginUser(login: string, password: string) {
  const supabase = await createClient()

  // Déterminer si c'est un email ou un username
  const isEmail = login.includes('@')
  
  let email = login
  
  // Si c'est un username, chercher l'email associé
  if (!isEmail) {
    const user = await prisma.user.findFirst({
      where: { username: login },
    })
    
    if (!user) {
      return { error: 'Utilisateur non trouvé' }
    }
    
    email = user.email
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, redirectTo: '/dashboard' }
}

export async function logoutUser() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      gameProfile: {
        include: {
          homeLocation: true,
        },
      },
    },
  })

  return dbUser
}

export async function checkOnboardingStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gameProfile: true,
    },
  })

  if (!user) return { step: 1 }
  if (!user.firstName || !user.lastName) return { step: 2 }
  if (!user.gameProfile) return { step: 3 }
  
  return { step: 0, complete: true }
}
