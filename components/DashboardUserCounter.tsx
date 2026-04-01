// ============================================
// components/DashboardUserCounter.tsx
// Compteur temps réel pour le dashboard
// ============================================

'use client'

import { useRealtimeUsers } from '@/lib/hooks/useRealtimeUsers'

export function DashboardUserCounter() {
  const { count, loading } = useRealtimeUsers()
  
  if (loading) return <span className="text-white/40">...</span>
  
  return <span className="tabular-nums">{count.toLocaleString('fr-FR')}</span>
}
