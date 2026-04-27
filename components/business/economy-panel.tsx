"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { formatCurrency } from "@/lib/utils"
import { 
  TrendingUp, Package, DollarSign, AlertCircle, 
  CheckCircle, ArrowUp, ArrowDown, Factory, 
  ShoppingCart, Clock 
} from "lucide-react"

interface EconomyData {
  currentStock: number
  totalProduced: number
  totalSold: number
  productionCost: number
  currentPrice: number
  optimalPriceMin: number
  optimalPriceMax: number
  recommendedPrice: number
  demandScore: number
  priceIndicator: string
  hourlyRevenue: number
  hourlySales: number
  hourlyProfit: number
  accumulatedRevenue: number
  footTraffic: number
  subType: string
  pricePositioning: string
}

export function EconomyPanel() {
  const [data, setData] = useState<EconomyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [produceQuantity, setProduceQuantity] = useState(10)
  const [newPrice, setNewPrice] = useState(0)
  const [message, setMessage] = useState<{type: string; text: string} | null>(null)

  useEffect(() => {
    fetchEconomyData()
  }, [])

  const fetchEconomyData = async () => {
    try {
      const res = await fetch("/api/business/economy")
      const result = await res.json()
      if (res.ok) {
        setData(result)
        setNewPrice(result.currentPrice || result.recommendedPrice)
      }
    } catch (error) {
      console.error("Error fetching economy data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProduce = async () => {
    try {
      const res = await fetch("/api/business/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: produceQuantity }),
      })
      
      const result = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: `${produceQuantity} unités produites pour ${formatCurrency(result.productionCost)}` })
        fetchEconomyData()
      } else {
        setMessage({ type: "error", text: result.error || "Erreur de production" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    }
  }

  const handlePriceUpdate = async () => {
    try {
      const res = await fetch("/api/business/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      })
      
      const result = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: result.message })
        fetchEconomyData()
      } else {
        setMessage({ type: "error", text: result.error || "Erreur de mise à jour" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    }
  }

  const handleCollectRevenue = async () => {
    try {
      const res = await fetch("/api/business/revenue/collect", { method: "POST" })
      const result = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: result.message })
        fetchEconomyData()
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de collecte" })
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Chargement de l'économie...</div>
  }

  if (!data) {
    return <div className="p-4 text-center text-muted-foreground">Aucune donnée économique disponible</div>
  }

  const getPriceIndicatorColor = () => {
    switch (data.priceIndicator) {
      case "GOOD": return "text-green-500"
      case "TOO_CHEAP": return "text-yellow-500"
      case "TOO_EXPENSIVE": return "text-red-500"
      default: return "text-muted-foreground"
    }
  }

  const getPriceIndicatorIcon = () => {
    switch (data.priceIndicator) {
      case "GOOD": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "TOO_CHEAP": return <ArrowDown className="w-4 h-4 text-yellow-500" />
      case "TOO_EXPENSIVE": return <ArrowUp className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Revenu/heure</h3>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(data.hourlyRevenue)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {data.hourlySales} ventes/h • {formatCurrency(data.hourlyProfit)} profit
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Stock</h3>
          </div>
          <p className="text-2xl font-bold">{data.currentStock}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {data.totalSold} vendus • {data.totalProduced} produits
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">À collecter</h3>
          </div>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(Number(data.accumulatedRevenue))}</p>
          <GlassButton 
            size="sm" 
            onClick={handleCollectRevenue}
            disabled={Number(data.accumulatedRevenue) <= 0}
            className="w-full mt-2"
          >
            Collecter
          </GlassButton>
        </GlassCard>
      </div>

      {/* Price Management */}
      <GlassCard className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Gestion des Prix
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Prix actuel</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-muted rounded-lg"
                  min={1}
                />
                <span className="text-muted-foreground">Ø</span>
              </div>
            </div>
            
            <GlassButton onClick={handlePriceUpdate} className="w-full">
              Mettre à jour le prix
            </GlassButton>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fourchette optimale:</span>
              <span>{formatCurrency(data.optimalPriceMin)} - {formatCurrency(data.optimalPriceMax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prix recommandé:</span>
              <span className="font-medium">{formatCurrency(data.recommendedPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coût de production:</span>
              <span>{formatCurrency(data.productionCost)}/unité</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Score de demande:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${data.demandScore}%` }}
                  />
                </div>
                <span className={`font-medium ${getPriceIndicatorColor()}`}>
                  {data.demandScore}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getPriceIndicatorIcon()}
              <span className={getPriceIndicatorColor()}>
                {data.priceIndicator === "GOOD" && "Prix optimal"}
                {data.priceIndicator === "TOO_CHEAP" && "Prix trop bas"}
                {data.priceIndicator === "TOO_EXPENSIVE" && "Prix trop élevé"}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Production */}
      <GlassCard className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Factory className="w-5 h-5" />
          Production
        </h3>
        
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Quantité à produire</label>
            <input
              type="number"
              value={produceQuantity}
              onChange={(e) => setProduceQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 bg-muted rounded-lg"
              min={1}
              max={1000}
            />
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            Coût: {formatCurrency(produceQuantity * data.productionCost)}
          </div>
          <GlassButton onClick={handleProduce}>
            Produire
          </GlassButton>
        </div>
      </GlassCard>

      {/* Message */}
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
