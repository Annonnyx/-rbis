"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { MapPin, Navigation, Building2, Users, Compass, LocateFixed } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

interface City {
  id: string
  name: string
  country: string
  latitude: number
  longitude: number
  population: number
  businessesCount: number
  usersCount: number
}

export function MapClient() {
  const { data: session, status } = useSafeSession()
  const [cities, setCities] = useState<City[]>([])
  const [userLocation, setUserLocation] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetchMapData()
    }
  }, [status])

  const fetchMapData = async () => {
    try {
      const [citiesRes, profileRes] = await Promise.all([
        fetch("/api/cities"),
        fetch("/api/profile"),
      ])
      
      if (citiesRes.ok) {
        setCities(await citiesRes.json())
      }
      if (profileRes.ok) {
        const profile = await profileRes.json()
        setUserLocation(profile.location?.city || null)
      }
    } catch (error) {
      console.error("Error fetching map data:", error)
    } finally {
      setLoading(false)
    }
  }

  const setLocation = async (cityId: string) => {
    try {
      const res = await fetch("/api/profile/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId }),
      })
      if (res.ok) {
        fetchMapData()
      }
    } catch (error) {
      console.error("Error setting location:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Compass className="w-16 h-16 text-primary/60 animate-spin" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Carte du monde</h1>
          <p className="text-muted-foreground">Explorez les villes d&apos;\u00D8rbis</p>
        </div>
        {userLocation && (
          <GlassCard liquid className="px-4 py-2 flex items-center gap-2">
            <LocateFixed className="w-5 h-5 text-primary" />
            <span className="text-sm">Vous êtes à <strong>{userLocation.name}</strong></span>
          </GlassCard>
        )}
      </div>

      {/* Map Placeholder */}
      <GlassCard liquid className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
            <MapPin className="w-20 h-20 text-primary relative" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Carte interactive</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            La carte interactive complète avec Google Maps sera bientôt disponible. 
            En attendant, explorez les villes ci-dessous.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="w-4 h-4" />
            <span>{cities.length} villes disponibles</span>
          </div>
        </div>
      </GlassCard>

      {/* Cities Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Villes disponibles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => {
            const isUserLocation = userLocation?.id === city.id
            return (
              <GlassCard 
                key={city.id} 
                className={`p-5 cursor-pointer transition-all ${
                  isUserLocation ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedCity(city)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isUserLocation ? "bg-primary/10" : "bg-accent"}`}>
                      <MapPin className={`w-5 h-5 ${isUserLocation ? "text-primary" : ""}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{city.name}</h3>
                      <p className="text-xs text-muted-foreground">{city.country}</p>
                    </div>
                  </div>
                  {isUserLocation && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      Vous
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{city.businessesCount} entreprises</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{city.usersCount} habitants</span>
                  </div>
                </div>

                {!isUserLocation && (
                  <GlassButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setLocation(city.id)
                    }}
                    variant="secondary"
                    size="sm"
                    className="w-full mt-4"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    M&apos;y installer
                  </GlassButton>
                )}
              </GlassCard>
            )
          })}
        </div>
      </div>

      {/* Selected City Modal */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard liquid className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedCity.name}</h3>
              <button
                onClick={() => setSelectedCity(null)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-muted-foreground mb-4">{selectedCity.country}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-background/50 text-center">
                <p className="text-2xl font-bold">{selectedCity.businessesCount}</p>
                <p className="text-xs text-muted-foreground">Entreprises</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 text-center">
                <p className="text-2xl font-bold">{selectedCity.usersCount}</p>
                <p className="text-xs text-muted-foreground">Habitants</p>
              </div>
            </div>

            {userLocation?.id !== selectedCity.id && (
              <GlassButton
                onClick={() => {
                  setLocation(selectedCity.id)
                  setSelectedCity(null)
                }}
                variant="primary"
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Déménager à {selectedCity.name}
              </GlassButton>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  )
}
