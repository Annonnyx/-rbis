'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'LOCATION_UNLOCKED' | 'TRANSFER_RECEIVED' | 'SUGGESTION_IMPLEMENTED'
    title: string
    message: string
    data?: any
    read: boolean
    createdAt: string
  }>>([])

  useEffect(() => {
    if (!userId) return

    // Subscribe to location changes
    const locationChannel = supabase
      .channel('location-unlocks')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'map_locations',
        },
        (payload) => {
          if (payload.new.unlocked && !payload.old.unlocked) {
            setNotifications(prev => [{
              id: `loc-${payload.new.id}-${Date.now()}`,
              type: 'LOCATION_UNLOCKED',
              title: 'Nouvelle zone débloquée !',
              message: `${payload.new.name} est maintenant accessible`,
              data: payload.new,
              read: false,
              createdAt: new Date().toISOString(),
            }, ...prev])
          }
        }
      )
      .subscribe()

    // Subscribe to transfers to user's accounts
    const transferChannel = supabase
      .channel('transfer-received')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        async (payload) => {
          // Check if this transaction is TO one of the user's accounts
          const { data: account } = await supabase
            .from('bank_accounts')
            .select('account_number, owner_id')
            .eq('id', payload.new.to_account_id)
            .single()

          if (account && account.owner_id === userId) {
            setNotifications(prev => [{
              id: `tx-${payload.new.id}`,
              type: 'TRANSFER_RECEIVED',
              title: 'Virement reçu',
              message: `Vous avez reçu ${(payload.new.amount / 100).toFixed(2)} Orbes`,
              data: payload.new,
              read: false,
              createdAt: new Date().toISOString(),
            }, ...prev])
          }
        }
      )
      .subscribe()

    // Subscribe to suggestion status changes
    const suggestionChannel = supabase
      .channel('suggestion-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'suggestions',
          filter: `author_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.status === 'IMPLEMENTED' && payload.old.status !== 'IMPLEMENTED') {
            setNotifications(prev => [{
              id: `sugg-${payload.new.id}`,
              type: 'SUGGESTION_IMPLEMENTED',
              title: 'Suggestion implémentée !',
              message: `"${payload.new.title}" a été ajouté au jeu`,
              data: payload.new,
              read: false,
              createdAt: new Date().toISOString(),
            }, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(locationChannel)
      supabase.removeChannel(transferChannel)
      supabase.removeChannel(suggestionChannel)
    }
  }, [userId])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}
