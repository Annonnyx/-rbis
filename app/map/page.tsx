// ============================================
// app/map/page.tsx
// Carte interactive du monde Ørbis
// ============================================

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getCurrentUser } from '@/app/actions/auth'
import { getAllCompaniesOnMap } from '@/app/actions/company'
import { PageHeader } from '@/components/PageHeader'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { MapSidebar } from '@/components/MapSidebar'
import { prisma } from '@/lib/prisma'

// Client component avec Leaflet (lazy-loaded, SSR disabled)
const MapClient = dynamic(
  () => import('@/components/MapClient').then(mod => mod.MapClient),
  { ssr: false, loading: () => <LoadingSkeleton variant="map" /> }
)

export default async function MapPage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer toutes les locations
  const locations = await prisma.mapLocation.findMany({
    include: {
      residents: { select: { userId: true } },
      companies: { select: { id: true, name: true } },
    },
  })
  
  // Récupérer les entreprises pour la carte
  const companiesResult = await getAllCompaniesOnMap()
  const companies = companiesResult.success ? companiesResult.companies : []
  
  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Sidebar avec liste des villes */}
      <MapSidebar 
        locations={locations} 
        totalUsers={await prisma.user.count()}
      />
      
      {/* Carte */}
      <div className="flex-1 relative">
        <Suspense fallback={<LoadingSkeleton variant="map" />}>
          <MapClient 
            locations={locations}
            companies={companies}
            userHomeId={user.gameProfile?.homeLocationId}
          />
        </Suspense>
      </div>
    </div>
  )
}
