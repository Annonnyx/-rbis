// ============================================
// lib/supabase.ts
// Clients Supabase pour Server et Browser
// ============================================

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createBrowserClient } from '@supabase/ssr'

// ============================================
// SERVER CLIENT (Server Components & Actions)
// ============================================

/**
 * Crée un client Supabase pour les Server Components et Server Actions
 * Gère les cookies automatiquement via Next.js headers/cookies
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore si appelé depuis un Server Component
          }
        },
      },
    }
  )
}

// ============================================
// BROWSER CLIENT (Client Components)
// ============================================

/**
 * Crée un client Supabase pour les Client Components
 * Gère les cookies côté navigateur
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ============================================
// SERVICE ROLE CLIENT (Admin Operations)
// ============================================

/**
 * Crée un client Supabase avec la clé service_role
 * ⚠️ UNIQUEMENT pour les opérations serveur sensibles
 * Ne jamais exposer cette clé côté client
 */
export function createServiceSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
