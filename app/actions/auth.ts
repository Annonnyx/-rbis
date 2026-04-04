// ============================================
// app/actions/auth.ts
// Server Actions pour l'authentification et l'onboarding
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { ActionResult } from '@/types'

const INITIAL_BALANCE = BigInt(100000) // ◎ 1 000,00 en centimes

/**
 * Génère un numéro de compte unique format ORB-XXXX-XXXX
 */
function generateAccountNumber(): string {
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

/**
 * Vérifie si un username est disponible
 * @param username - Le username à vérifier
 * @returns true si disponible, false sinon
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: { username: { equals: username, mode: 'insensitive' } },
  })
  return !existing
}

/**
 * Compte le nombre total d'utilisateurs
 */
async function countUsers(): Promise<number> {
  return prisma.user.count()
}

/**
 * Débloque les locations selon le nombre d'utilisateurs
 * Appelée après chaque inscription complète
 */
async function checkLocationUnlocks(): Promise<void> {
  const totalUsers = await countUsers()
  
  await prisma.mapLocation.updateMany({
    where: {
      unlocked: false,
      requiredUsersToUnlock: { lte: totalUsers },
    },
    data: { unlocked: true },
  })
  
  revalidatePath('/map')
}

/**
 * Inscrit un nouvel utilisateur (étape 1)
 * Crée le user Supabase + User Prisma
 */
export interface RegisterData {
  email: string
  password: string
  username: string
}

export async function registerUser(data: RegisterData): Promise<ActionResult<{ userId: string }>> {
  const supabase = await createServerSupabaseClient()
  
  // 1. Créer le user dans Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { username: data.username },
    },
  })
  
  if (authError) {
    return { success: false, error: authError.message }
  }
  
  if (!authData.user) {
    return { success: false, error: 'Erreur lors de la création du compte' }
  }
  
  // 2. Créer ou récupérer le user dans Prisma
  try {
    // Vérifier si l'utilisateur existe déjà (cas de re-registration après échec partiel)
    const existingUser = await prisma.user.findUnique({
      where: { id: authData.user.id },
    })
    
    if (existingUser) {
      return { success: true, data: { userId: existingUser.id } }
    }
    
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: data.email,
        username: data.username,
      },
    })
    
    return { success: true, data: { userId: user.id } }
  } catch (error) {
    // En cas d'erreur Prisma, on log mais on ne supprime pas le user Supabase
    // Il pourra être récupéré ou recréé plus tard
    console.error('Prisma user creation error:', error)
    return { success: false, error: 'Erreur lors de la création du profil' }
  }
}

/**
 * Met à jour le profil utilisateur (étape 2)
 */
export async function updateUserProfile(
  userId: string,
  data: { firstName: string; lastName: string }
): Promise<ActionResult> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du profil' }
  }
}

/**
 * Sélectionne la résidence et finalise l'onboarding (étape 3)
 * Crée GameProfile + BankAccount + crédite + débloque locations
 */
export async function selectResidence(
  userId: string,
  locationId: string
): Promise<ActionResult> {
  try {
    // 1. Vérifier que la location est bien débloquée
    const location = await prisma.mapLocation.findUnique({
      where: { id: locationId },
    })
    
    if (!location || !location.unlocked) {
      return { success: false, error: 'Cette ville n\'est pas disponible' }
    }
    
    // 2. Vérifier que l'utilisateur n'a pas déjà un profil
    const existingProfile = await prisma.gameProfile.findUnique({
      where: { userId },
    })
    
    if (existingProfile) {
      return { success: false, error: 'Profil déjà existant' }
    }
    
    // 3. Créer le compte bancaire avec solde initial
    const accountNumber = generateAccountNumber()
    const bankAccount = await prisma.bankAccount.create({
      data: {
        ownerId: userId,
        ownerType: 'PERSONAL',
        balance: INITIAL_BALANCE,
        accountNumber,
      },
    })
    
    // 4. Créer le GameProfile
    await prisma.gameProfile.create({
      data: {
        userId,
        homeLocationId: locationId,
      },
    })
    
    // 5. Vérifier les déblocages de locations
    await checkLocationUnlocks()
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Residence selection error:', error)
    return { success: false, error: 'Erreur lors de la sélection de la résidence' }
  }
}

/**
 * Connecte un utilisateur
 */
export async function loginUser(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Déconnecte l'utilisateur
 */
export async function logoutUser(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Récupère l'utilisateur courant avec son profil complet
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      gameProfile: {
        include: { homeLocation: true },
      },
      companies: true,
    },
  })
  
  return dbUser
}

/**
 * Vérifie le statut d'onboarding
 * @returns L'étape actuelle (1, 2, 3, ou 0 si complet)
 */
export async function checkOnboardingStatus(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { gameProfile: true },
  })
  
  if (!user) return 1
  if (!user.firstName || !user.lastName) return 2
  if (!user.gameProfile) return 3
  
  return 0 // Onboarding complet
}
