"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Handshake, Truck, Users, Star, TrendingUp, CheckCircle } from "lucide-react"

interface B2BClient {
  id: string
  name: string
  industry: string
  contractStatus: string
  monthlyVolume: number
  unitPrice: number
  satisfaction: number
  loyaltyYears: number
  totalRevenue: number
}

interface Supplier {
  id: string
  name: string
  materialType: string
  basePrice: number
  qualityRating: number
  reliability: number
  discountRate: number
}

interface Prospect {
  id: string
  name: string
  industry: string
  volume: number
  price: number
  potentialRevenue: number
}

export function B2BPanel() {
  const [clients, setClients] = useState<B2BClient[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchB2B = async () => {
    try {
      const res = await fetch("/api/b2b")
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
        setSuppliers(data.suppliers)
        setProspects(data.prospects)
      }
    } catch (error) {
      console.error("Error fetching B2B:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchB2B()
  }, [])

  const signClient = async (prospect: Prospect) => {
    try {
      const res = await fetch("/api/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: prospect.id,
          name: prospect.name,
          industry: prospect.industry,
          monthlyVolume: prospect.volume,
          unitPrice: prospect.price
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchB2B()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la signature" })
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  const totalB2BRevenue = clients.reduce((sum, c) => sum + Number(c.totalRevenue), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Handshake className="w-6 h-6 text-blue-500" />
            B2B & Supply Chain
          </h2>
          <p className="text-muted-foreground">{clients.length} clients, {suppliers.length} fournisseurs</p>
        </div>
        <GlassCard className="px-4 py-2">
          <p className="text-sm text-muted-foreground">Revenus B2B totaux</p>
          <p className="text-xl font-bold">{totalB2BRevenue.toLocaleString()}Ø</p>
        </GlassCard>
      </div>

      {/* Clients Section */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          Clients B2B
        </h3>
        {clients.length === 0 ? (
          <p className="text-muted-foreground">Aucun client B2B encore</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {clients.map((client) => (
              <div key={client.id} className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{client.industry}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-medium">
                    {client.contractStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Volume mensuel</p>
                    <p className="font-medium">{client.monthlyVolume.toLocaleString()} unités</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prix unitaire</p>
                    <p className="font-medium">{client.unitPrice}Ø</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{(client.satisfaction * 100).toFixed(0)}% satisfaction</span>
                  {client.loyaltyYears > 0 && (
                    <span className="text-sm text-muted-foreground">• {client.loyaltyYears} ans de fidélité</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Prospects Section */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          Prospects
        </h3>
        {prospects.length === 0 ? (
          <p className="text-muted-foreground">Tous les prospects ont été contactés</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {prospects.map((prospect) => (
              <div key={prospect.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{prospect.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{prospect.industry}</p>
                  </div>
                </div>
                <div className="text-sm space-y-1 mb-3">
                  <p><span className="text-muted-foreground">Volume:</span> {prospect.volume.toLocaleString()}/mois</p>
                  <p><span className="text-muted-foreground">Prix:</span> {prospect.price}Ø/unité</p>
                  <p className="text-green-500">
                    <span className="text-muted-foreground">Potentiel:</span> {prospect.potentialRevenue.toLocaleString()}Ø/an
                  </p>
                </div>
                <GlassButton size="sm" onClick={() => signClient(prospect)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Signer contrat
                </GlassButton>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Suppliers Section */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-500" />
          Fournisseurs
        </h3>
        {suppliers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">Aucun fournisseur encore</p>
            <GlassButton size="sm" onClick={() => setShowAddSupplier(true)}>
              Ajouter un fournisseur
            </GlassButton>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <p className="font-semibold">{supplier.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{supplier.materialType}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Prix base</p>
                    <p className="font-medium">{supplier.basePrice}Ø</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Qualité</p>
                    <p className="font-medium">{supplier.qualityRating}/10</p>
                  </div>
                </div>
                {supplier.discountRate > 0 && (
                  <p className="text-sm text-green-500 mt-2">
                    Remise: {(supplier.discountRate * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
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
