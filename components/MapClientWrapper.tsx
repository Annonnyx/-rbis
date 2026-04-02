// ============================================
// components/MapClientWrapper.tsx
// Wrapper client pour la carte (SSR disabled)
// ============================================

'use client'

import dynamic from 'next/dynamic'
import { LoadingSkeleton } from './LoadingSkeleton'

const MapClient = dynamic(
  () => import('@/components/MapClient').then(mod => mod.MapClient),
  { ssr: false, loading: () => <LoadingSkeleton variant="map" /> }
)

interface MapClientWrapperProps {
  locations: any[]
  companies: any[]
  userHomeId?: string | null
}

export function MapClientWrapper({ locations, companies, userHomeId }: MapClientWrapperProps) {
  return (
    <MapClient 
      locations={locations}
      companies={companies}
      userHomeId={userHomeId}
    />
  )
}
