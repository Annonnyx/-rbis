// ============================================
// components/MapLocationSelector.tsx
// Sélecteur de location avec carte Leaflet
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Lock, Unlock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { MapLocation } from '@/types'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icons in Next.js
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const lockedIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    width: 30px; 
    height: 30px; 
    background: rgba(255,255,255,0.1); 
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  "><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

interface MapLocationSelectorProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

// Center map on selected location
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  return null
}

export function MapLocationSelector({ selectedId, onSelect }: MapLocationSelectorProps) {
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]) // Paris default
  
  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        setLocations(data.locations || [])
        setLoading(false)
      })
  }, [])
  
  if (loading) {
    return (
      <div className="h-64 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <div className="animate-pulse text-white/40">Chargement...</div>
      </div>
    )
  }
  
  const unlockedLocations = locations.filter(l => l.unlocked)
  const lockedLocations = locations.filter(l => !l.unlocked)
  
  return (
    <div className="space-y-4">
      {/* Map - plus grande et avec meilleur contraste */}
      <div className="h-80 md:h-96 rounded-xl overflow-hidden border border-white/10">
        <MapContainer
          center={mapCenter}
          zoom={2}
          minZoom={2}
          maxZoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController center={mapCenter} />
          
          {unlockedLocations.map(location => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelect(location.id),
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong className="text-violet-600">{location.name}</strong>
                  <p className="text-xs text-gray-500 mt-1">✓ Disponible</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {lockedLocations.map(location => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={lockedIcon}
            >
              <Popup>
                <div className="text-center">
                  <span className="text-gray-400">{location.name}</span>
                  <p className="text-xs text-gray-400 mt-1">🔒 Verrouillée</p>
                  <p className="text-xs text-amber-600">{location.requiredUsersToUnlock} utilisateurs requis</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Location list */}
      <div className="grid gap-2 max-h-48 overflow-y-auto">
        {locations.map(location => {
          const isSelected = selectedId === location.id
          const isLocked = !location.unlocked
          
          return (
            <button
              key={location.id}
              onClick={() => !isLocked && onSelect(location.id)}
              disabled={isLocked}
              onMouseEnter={() => setMapCenter([location.lat, location.lng])}
              className={`
                flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                ${isSelected 
                  ? 'bg-violet-500/30 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                  : isLocked 
                    ? 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed grayscale'
                    : 'bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {isLocked ? (
                  <Lock className="w-4 h-4 text-white/30" />
                ) : (
                  <Unlock className="w-4 h-4 text-violet-400" />
                )}
                <div className="text-left">
                  <p className={`font-medium ${isSelected ? 'text-violet-300' : 'text-white'}`}>
                    {location.name}
                  </p>
                  {isLocked ? (
                    <p className="text-xs text-amber-400/70">
                      🔒 {location.requiredUsersToUnlock} utilisateurs requis
                    </p>
                  ) : (
                    <p className="text-xs text-green-400/70">✓ Disponible</p>
                  )}
                </div>
              </div>
              
              {isLocked && (
                <Badge variant="neutral" className="text-xs">
                  {location.requiredUsersToUnlock} users
                </Badge>
              )}
              
              {isSelected && (
                <Badge variant="violet" className="text-xs">Sélectionnée</Badge>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
