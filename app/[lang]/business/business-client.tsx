"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, TrendingUp, DollarSign, Plus, Edit } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Business {
  id: string
  name: string
  description: string | null
  objective: string | null
  product: string | null
  service: string | null
  capital: number
  isActive: boolean
  stock: {
    symbol: string
    currentPrice: number
    totalShares: number
    availableShares: number
  } | null
}

// Check if we're in the browser
const isBrowser = typeof window !== "undefined"

// Safe hook that handles prerendering
function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

export function BusinessClient() {
  const { data: session, status } = useSafeSession()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    objective: "",
    product: "",
    service: "",
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchBusiness()
    }
  }, [status])

  const fetchBusiness = async () => {
    try {
      const res = await fetch("/api/business")
      if (res.ok) {
        const data = await res.json()
        setBusiness(data)
      }
    } catch (error) {
      console.error("Error fetching business:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchBusiness()
        setShowCreate(false)
      }
    } catch (error) {
      console.error("Error creating business:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Building2 className="w-12 h-12 text-orbe animate-pulse" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (showCreate) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Créer mon entreprise</h1>
        <div className="glass rounded-2xl p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Capital minimum requis</p>
          <p className="text-2xl font-bold text-orbe">{formatCurrency(300)}</p>
        </div>
        <form onSubmit={handleCreate} className="glass rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nom de l&apos;entreprise</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-orbe outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-orbe outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Objectif</label>
            <input type="text" value={formData.objective} onChange={(e) => setFormData({ ...formData, objective: e.target.value })} placeholder="Ex: Devenir le leader du savon écologique" className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-orbe outline-none" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Produit</label>
              <input type="text" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} placeholder="Ex: Savon artisanal" className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-orbe outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Service</label>
              <input type="text" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} placeholder="Ex: Livraison à domicile" className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-orbe outline-none" />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-3 rounded-lg border border-input hover:bg-accent transition-colors">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-orbe text-white rounded-lg hover:bg-orbe-dark transition-colors">Créer ({formatCurrency(300)})</button>
          </div>
        </form>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <Building2 className="w-20 h-20 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Aucune entreprise</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Vous n&apos;avez pas encore créé d&apos;entreprise. Lancez votre business pour seulement 300 Ø.
        </p>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-6 py-3 bg-orbe text-white rounded-lg hover:bg-orbe-dark transition-colors">
          <Plus className="w-5 h-5" />
          Créer mon entreprise
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{business.name}</h1>
        <button className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-accent transition-colors">
          <Edit className="w-4 h-4" />
          Modifier
        </button>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-sm ${business.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
          {business.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Capital</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(Number(business.capital))}</p>
        </div>
        {business.stock && (
          <>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orbe/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orbe" />
                </div>
                <span className="text-sm text-muted-foreground">Prix de l&apos;action</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(Number(business.stock.currentPrice))}</p>
              <p className="text-xs text-muted-foreground mt-1">{business.stock.symbol}</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-muted-foreground">Actions disponibles</span>
              </div>
              <p className="text-2xl font-bold">{business.stock.availableShares}</p>
              <p className="text-xs text-muted-foreground mt-1">sur {business.stock.totalShares}</p>
            </div>
          </>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {business.description && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-muted-foreground">{business.description}</p>
          </div>
        )}
        {business.objective && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Objectif</h3>
            <p className="text-muted-foreground">{business.objective}</p>
          </div>
        )}
        {business.product && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Produit</h3>
            <p className="text-muted-foreground">{business.product}</p>
          </div>
        )}
        {business.service && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Service</h3>
            <p className="text-muted-foreground">{business.service}</p>
          </div>
        )}
      </div>
    </div>
  )
}
