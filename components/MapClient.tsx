// ============================================
// components/MapClient.tsx
// Composant client Leaflet pour la carte interactive
// ============================================

'use client'

import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { GlassCard } from './ui/GlassCard'
import { Badge } from './ui/Badge'
import { Lock, Unlock, Building2, Home } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

// Icônes custom
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <span style="color: white; font-size: 16px;">${icon}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

const unlockedIcon = createCustomIcon('#7c3aed', '📍')
const lockedIcon = createCustomIcon('rgba(255,255,255,0.2)', '🔒')
const companyIcon = createCustomIcon('#e879f9', '🏢')
const homeIcon = createCustomIcon('#22c55e', '🏠')

interface MapClientProps {
  locations: any[]
  companies: any[]
  userHomeId: string
}

export function MapClient({ locations, companies, userHomeId }: MapClientProps) {
  // Centre de la carte (position de l'utilisateur ou Paris par défaut)
  const center = useMemo(() => {
    const homeLocation = locations.find(l => l.id === userHomeId)
    return homeLocation ? [homeLocation.lat, homeLocation.lng] : [48.8566, 2.3522]
  }, [locations, userHomeId])
  
  // Grouper les entreprises par location
  const companiesByLocation = useMemo(() => {
    const grouped: Record<string, typeof companies> = {}
    companies.forEach(c => {
      if (!grouped[c.locationId]) grouped[c.locationId] = []
      grouped[c.locationId].push(c)
    })
    return grouped
  }, [companies])
  
  return (
    <MapContainer
      center={center as [number, number]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {/* Marqueurs des locations */}
      {locations.map(location => {
        const isHome = location.id === userHomeId
        const isUnlocked = location.unlocked
        const residentCount = location.residents?.length || 0
        const companyCount = location.companies?.length || 0
        const companiesHere = companiesByLocation[location.id] || []
        
        return (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={isHome ? homeIcon : isUnlocked ? unlockedIcon : lockedIcon}
          >
            <Popup className="custom-popup">
              <div className="min-w-[200px]">
                {isHome && (
                  <Badge variant="success" className="mb-2">Votre résidence</Badge>
                )}
                
                <h3 className="font-semibold text-white mb-1">{location.name}</h3>
                
                {isUnlocked ? (
                  <>
                    <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" /> {residentCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {companyCount}
                      </span>
                    </div>
                    
                    {companiesHere.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-white/40 mb-2">Entreprises</p>
                        {companiesHere.slice(0, 3).map(company => (
                          <Link 
                            key={company.id}
                            href={`/company/${company.id}`}
                            className="block text-sm text-violet-400 hover:text-violet-300 truncate"
                          >
                            {company.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                      <Lock className="w-4 h-4" />
                      <span>Verrouillée</span>
                    </div>
                    <p className="text-xs text-white/40">
                      Déverrouillage à {location.requiredUsersToUnlock} membres
                    </p>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400/50 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (residentCount / location.requiredUsersToUnlock) * 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-1">
                      {residentCount} / {location.requiredUsersToUnlock} membres
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
      
      {/* Marqueurs des entreprises (en plus des locations si différentes) */}
      {companies.map(company => {
        const location = locations.find(l => l.id === company.locationId)
        if (!location) return null
        
        return (
          <Marker
            key={`company-${company.id}`}
            position={[location.lat, location.lng]}
            icon={companyIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <GlassCard padding="sm" className="min-w-[180px]">
                <h4 className="font-medium text-white">{company.name}</h4>
                <p className="text-xs text-white/50 mt-1 line-clamp-2">
                  {company.objective}
                </p>
                <p className="text-xs text-white/30 mt-2">
                  par {company.owner?.displayName || company.owner?.username}
                </p>
                <Link 
                  href={`/company/${company.id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 mt-2 block"
                >
                  Voir la fiche →
                </Link>
              </GlassCard>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
