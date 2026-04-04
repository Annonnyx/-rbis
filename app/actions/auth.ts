// ============================================
// app/actions/auth.ts
// Server Actions pour l'authentification et l'onboarding
// Onboarding 3 étapes : Auth Supabase (1) → Metadata (2) → Création Prisma complète (3)
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase'
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
 * Crée le user Supabase Auth uniquement, PAS dans Prisma
 * Stocke username dans metadata pour étape 3
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
      data: { 
        username: data.username,
        onboarding_step: 1 
      },
    },
  })
  
  if (authError) {
    return { success: false, error: authError.message }
  }
  
  if (!authData.user) {
    return { success: false, error: 'Erreur lors de la création du compte' }
  }
  
  // 2. Connecter immédiatement pour créer une session (nécessaire pour étape 2)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
  
  if (signInError) {
    console.error('Auto-login error:', signInError)
    // On continue quand même, l'utilisateur pourra se reconnecter manuellement
  }
  
  return { success: true, data: { userId: authData.user.id } }
}

/**
 * Met à jour le profil utilisateur (étape 2)
 * Stocke firstName/lastName dans Supabase metadata via service role, PAS dans Prisma
 */
export async function updateUserProfile(
  userId: string,
  data: { firstName: string; lastName: string }
): Promise<ActionResult> {
  const supabaseAdmin = createServiceSupabaseClient()
  
  // Mettre à jour les metadata via service role (pas besoin de session)
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      firstName: data.firstName,
      lastName: data.lastName,
      onboarding_step: 2,
    },
  })
  
  if (updateError) {
    console.error('Profile update error:', updateError)
    return { success: false, error: 'Erreur lors de la mise à jour du profil' }
  }
  
  return { success: true }
}

/**
 * Sélectionne la résidence et finalise l'onboarding (étape 3)
 * Crée l'utilisateur Prisma avec TOUTES les données + GameProfile + BankAccount
 */
export async function selectResidence(
  userId: string,
  locationId: string
): Promise<ActionResult> {
  try {
    const supabaseAdmin = createServiceSupabaseClient()
    
    // 1. Récupérer les données Supabase Auth via service role (pas besoin de session)
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authError || !authUser) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }
    
    const metadata = authUser.user_metadata
    const email = authUser.email
    const username = metadata?.username
    const firstName = metadata?.firstName
    const lastName = metadata?.lastName
    
    if (!email || !username || !firstName || !lastName) {
      return { success: false, error: 'Données de profil incomplètes' }
    }
    
    // 2. Vérifier que la location est bien débloquée
    const location = await prisma.mapLocation.findUnique({
      where: { id: locationId },
    })
    
    if (!location || !location.unlocked) {
      return { success: false, error: 'Cette ville n\'est pas disponible' }
    }
    
    // 3. Vérifier que l'utilisateur n'a pas déjà un profil
    const existingProfile = await prisma.gameProfile.findUnique({
      where: { userId },
    })
    
    if (existingProfile) {
      return { success: false, error: 'Profil déjà existant' }
    }
    
    // 4. Créer l'utilisateur dans Prisma avec TOUTES les données
    await prisma.user.create({
      data: {
        id: userId,
        email,
        username,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
      },
    })
    
    // 5. Créer le compte bancaire avec solde initial
    const accountNumber = generateAccountNumber()
    await prisma.bankAccount.create({
      data: {
        ownerId: userId,
        ownerType: 'PERSONAL',
        balance: INITIAL_BALANCE,
        accountNumber,
      },
    })
    
    // 6. Créer le GameProfile
    await prisma.gameProfile.create({
      data: {
        userId,
        homeLocationId: locationId,
      },
    })
    
    // 7. Mettre à jour le metadata Supabase via service role (reuse supabaseAdmin)
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { onboarding_step: 3, onboarding_complete: true },
    })
    
    // 8. Vérifier les déblocages de locations
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
