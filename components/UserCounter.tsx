// ============================================
// components/UserCounter.tsx
// Compteur d'utilisateurs temps réel
// ============================================

'use client'

import { useRealtimeUsers } from '@/lib/hooks/useRealtimeUsers'

export function UserCounter() {
  const { count, loading } = useRealtimeUsers()
  
  return (
    <p className="text-3xl font-bold text-white tabular-nums">
      {loading ? '...' : count.toLocaleString('fr-FR')}
    </p>
  )
}
