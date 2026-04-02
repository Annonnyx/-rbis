// ============================================
// lib/hooks/useRealtimeUsers.ts
// Hook pour le compteur d'utilisateurs en temps réel
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

interface UseRealtimeUsersReturn {
  count: number
  loading: boolean
}

/**
 * Hook pour le compteur d'utilisateurs en temps réel via Supabase Realtime
 * Écoute les changements sur la table users
 * @returns { count, loading }
 * @example const { count } = useRealtimeUsers()
 */
export function useRealtimeUsers(): UseRealtimeUsersReturn {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    
    // Récupérer le count initial
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (!error && count !== null) {
          setCount(count)
        }
        setLoading(false)
      })
    
    // Souscription Realtime
    const channel = supabase
      .channel('users-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          // Mettre à jour le count quand il y a des changements
          supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .then(({ count }) => {
              if (count !== null) setCount(count)
            })
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return { count, loading }
}
