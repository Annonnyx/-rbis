"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Store, MapPin, TrendingUp, DollarSign, Plus, Wallet } from "lucide-react"

interface Franchise {
  id: string
  brandName: string
  city: string
  country: string
  entryFee: number
  royaltyRate: number
  monthlyRevenue: number
  totalRevenue: number
  royaltyPaid: number
  status: string
  openedAt: string
}

interface Location {
  city: string
  country: string
  multiplier: number
  entryFee: number
  expectedMonthlyRevenue: number
  available: boolean
}

export function FranchisePanel() {
  const [franchises, setFranchises] = useState<Franchise[]>([])
  const [availableLocations, setAvailableLocations] = useState<Location[]>([])
  const [businessType, setBusinessType] = useState<string>("")
  const [totalRoyaltyRevenue, setTotalRoyaltyRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchFranchises = async () => {
    try {
      const res = await fetch("/api/franchises")
      if (res.ok) {
        const data = await res.json()
        setFranchises(data.franchises)
        setAvailableLocations(data.availableLocations)
        setBusinessType(data.businessType)
        setTotalRoyaltyRevenue(data.totalRoyaltyRevenue)
      }
    } catch (error) {
      console.error("Error fetching franchises:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFranchises()
  }, [])

  const openFranchise = async (location: Location) => {
    try {
      const res = await fetch("/api/franchises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: location.city,
          country: location.country,
          entryFee: location.entryFee,
          royaltyRate: 0.05 // 5% royalty
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchFranchises()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'ouverture" })
    }
  }

  const collectRoyalties = async (franchiseId: string) => {
    try {
      const res = await fetch("/api/franchises", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ franchiseId })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchFranchises()
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la collecte" })
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6 text-yellow-500" />
            Franchises
          </h2>
          <p className="text-muted-foreground">{franchises.length} franchises ouvertes</p>
        </div>
        <GlassCard className="px-4 py-2">
          <p className="text-sm text-muted-foreground">Royalties totales</p>
          <p className="text-xl font-bold">{totalRoyaltyRevenue.toLocaleString()}Ø</p>
        </GlassCard>
      </div>

      {/* Active Franchises */}
      {franchises.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Franchises Actives</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {franchises.map((franchise) => (
              <div key={franchise.id} className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{franchise.brandName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {franchise.city}, {franchise.country}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-medium">
                    {franchise.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Royalties</p>
                    <p className="font-medium">{(franchise.royaltyRate * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenu mensuel</p>
                    <p className="font-medium">{Number(franchise.monthlyRevenue).toLocaleString()}Ø</p>
                  </div>
                </div>

                {franchise.monthlyRevenue > 0 && (
                  <GlassButton size="sm" onClick={() => collectRoyalties(franchise.id)}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Collecter royalties
                  </GlassButton>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Available Locations */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ouvrir une Franchise
        </h3>
        
        {availableLocations.filter(l => l.available).length === 0 ? (
          <p className="text-muted-foreground">Toutes les locations disponibles sont prises</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableLocations.filter(l => l.available).map((location) => (
              <div key={location.city} className="p-4 rounded-lg border border-border">
                <p className="font-semibold">{location.city}</p>
                <p className="text-sm text-muted-foreground">{location.country}</p>
                
                <div className="my-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Droit d'entrée:</span>
                    <span className="font-medium">{location.entryFee.toLocaleString()}Ø</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenu estimé:</span>
                    <span className="font-medium text-green-500">
                      {location.expectedMonthlyRevenue.toLocaleString()}Ø/mois
                    </span>
                  </div>
                </div>

                <GlassButton size="sm" onClick={() => openFranchise(location)} className="w-full">
                  <Store className="w-4 h-4 mr-2" />
                  Ouvrir
                </GlassButton>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Info Card */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-3">Comment ça marche</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Wallet className="w-4 h-4 mt-0.5 text-yellow-500" />
            Payez le droit d'entrée pour ouvrir une franchise dans une nouvelle ville
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 mt-0.5 text-green-500" />
            Les franchisés génèrent des revenus mensuels automatiquement
          </li>
          <li className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 mt-0.5 text-primary" />
            Collectez les royalties (5% des revenus) chaque mois
          </li>
        </ul>
      </GlassCard>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
