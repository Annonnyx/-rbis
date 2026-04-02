// ============================================
// lib/hooks/useCurrentUser.ts
// Hook pour récupérer l'utilisateur courant côté client
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

interface UseCurrentUserReturn {
  user: User | null
  loading: boolean
  error: Error | null
}

/**
 * Hook pour accéder à l'utilisateur authentifié côté client
 * @returns { user, loading, error }
 * @example const { user } = useCurrentUser()
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    
    // Récupérer l'utilisateur initial
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        setError(error)
      } else {
        setUser(user)
      }
      setLoading(false)
    })
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return { user, loading, error }
}
