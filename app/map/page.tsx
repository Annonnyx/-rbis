'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { getAllLocations } from '@/app/actions/map'
import { GlassCard } from '@/components/GlassCard'
import { Lock, Building2, Home } from 'lucide-react'

import 'leaflet/dist/leaflet.css'

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  unlocked: boolean
  requiredUsersToUnlock: number
  companies: Array<{
    id: string
    name: string
    objective: string
  }>
}

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLocations() {
      const result = await getAllLocations()
      if (result.locations) {
        setLocations(result.locations)
      }
      if (result.totalUsers !== undefined) {
        setTotalUsers(result.totalUsers)
      }
      setLoading(false)
    }

    loadLocations()
  }, [])

  // Custom icons
  const unlockedIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjN2MzYWVkIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  const lockedIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNmI3MjgwIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjNmI3MjgwIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  const companyIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDZhMTgyIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjMDZhMTgyIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/50">Chargement de la carte...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Carte</h1>
        <GlassCard padding="sm" className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Home size={16} className="text-violet-400" />
            <span>Zone débloquée</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Building2 size={16} className="text-cyan-400" />
            <span>Entreprise</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Lock size={16} className="text-gray-400" />
            <span>Zone verrouillée</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <GlassCard className="lg:col-span-3 h-[600px] overflow-hidden p-0">
          <MapContainer
            center={[48.8566, 2.3522]}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={[location.lat, location.lng]}
                icon={location.unlocked ? unlockedIcon : lockedIcon}
              >
                <Popup className="glass-popup">
                  <div className="p-2">
                    <h3 className="font-semibold text-white">{location.name}</h3>
                    {location.unlocked ? (
                      <>
                        <p className="text-sm text-green-400">Zone débloquée</p>
                        {location.companies.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-white/50">Entreprises :</p>
                            {location.companies.map((company) => (
                              <p key={company.id} className="text-sm text-cyan-300">
                                {company.name}
                              </p>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Débloqué à {location.requiredUsersToUnlock} membres
                        <br />
                        ({totalUsers} / {location.requiredUsersToUnlock})
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            {/* Company markers */}
            {locations.flatMap((location) =>
              location.companies.map((company) => (
                <Marker
                  key={`company-${company.id}`}
                  position={[location.lat + (Math.random() - 0.5) * 0.5, location.lng + (Math.random() - 0.5) * 0.5]}
                  icon={companyIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-white">{company.name}</h3>
                      <p className="text-sm text-white/60">{company.objective}</p>
                      <p className="text-xs text-cyan-400 mt-1">{location.name}</p>
                    </div>
                  </Popup>
                </Marker>
              ))
            )}
          </MapContainer>
        </GlassCard>

        {/* Locations list */}
        <GlassCard className="h-[600px] overflow-y-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Zones</h2>
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`p-3 rounded-xl border ${
                  location.unlocked
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/5 border-gray-500/20 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{location.name}</h3>
                  {location.unlocked ? (
                    <Home size={16} className="text-violet-400" />
                  ) : (
                    <Lock size={16} className="text-gray-400" />
                  )}
                </div>
                {!location.unlocked && (
                  <p className="text-xs text-gray-400 mt-1">
                    Débloqué à {location.requiredUsersToUnlock} membres
                  </p>
                )}
                {location.companies.length > 0 && (
                  <p className="text-xs text-cyan-400 mt-1">
                    {location.companies.length} entreprise(s)
                  </p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
