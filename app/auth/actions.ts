// ============================================
// app/auth/actions.ts
// Server Actions pour l'authentification OAuth Google
// ============================================

'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * Initialise la connexion OAuth avec Google
 * Retourne l'URL OAuth pour ouverture côté client
 */
export async function signInWithGoogle(): Promise<string> {
  const supabase = await createServerSupabaseClient()
  
  // Récupérer l'origin pour le callback
  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('[signInWithGoogle] Error:', error)
    throw new Error('Erreur lors de l\'initialisation de la connexion Google')
  }

  if (!data.url) {
    throw new Error('URL OAuth non générée')
  }

  return data.url
}

/**
 * Déconnecte l'utilisateur
 * Supprime la session et redirige vers la page d'accueil
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Récupère l'utilisateur courant depuis Supabase
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
