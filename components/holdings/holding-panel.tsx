"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Building2, TrendingUp, Shield, AlertTriangle, ChevronRight, Plus, Briefcase } from "lucide-react"

interface Holding {
  id: string
  name: string
  legalStructure: string
  taxOptimizationLevel: string
  capital: number
  annualCost: number
  taxRate: number
  revenueMultiplier: number
  hasDeductions: boolean
  hasAmortizations: boolean
  hasProvisions: boolean
  hasTaxCredits: boolean
  hasOffshore: boolean
  hasTransferPricing: boolean
  auditRisk: number
  reputationRisk: number
  subsidiaries: any[]
}

export function HoldingPanel() {
  const [holding, setHolding] = useState<Holding | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [holdingName, setHoldingName] = useState("")
  const [selectedStructure, setSelectedStructure] = useState<string>("SARL")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [userBalance, setUserBalance] = useState<number>(0)
  const HOLDING_UNLOCK_THRESHOLD = 100000 // 100k Ø

  const fetchHolding = async () => {
    try {
      const res = await fetch("/api/holdings")
      if (res.ok) {
        const data = await res.json()
        setHolding(data.holding)
      }
    } catch (error) {
      console.error("Error fetching holding:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBalance = async () => {
    try {
      const res = await fetch("/api/bank/accounts")
      if (res.ok) {
        const accounts = await res.json()
        const mainAccount = accounts.find((a: any) => a.isMain)
        if (mainAccount) {
          setUserBalance(Number(mainAccount.balance))
        }
      }
    } catch (error) {
      console.error("Error fetching user balance:", error)
    }
  }

  useEffect(() => {
    fetchHolding()
    fetchUserBalance()
  }, [])

  const handleCreate = async () => {
    if (!holdingName || !selectedStructure) return

    try {
      const res = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: holdingName,
          legalStructure: selectedStructure
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        setShowCreateForm(false)
        setHoldingName("")
        fetchHolding()
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de la création" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    }
  }

  const handleUpgrade = async (targetLevel: string) => {
    try {
      const res = await fetch("/api/holdings/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLevel })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchHolding()
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de l'upgrade" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    }
  }

  const legalStructures = [
    { value: "SARL", name: "SARL", cost: 2000, multiplier: 1.2, taxRate: 0.20 },
    { value: "SAS", name: "SAS", cost: 3000, multiplier: 1.2, taxRate: 0.25 },
    { value: "HOLDING", name: "Holding", cost: 15000, multiplier: 1.4, taxRate: 0.15 },
    { value: "OFFSHORE", name: "Offshore", cost: 50000, multiplier: 1.7, taxRate: 0.05 }
  ]

  const upgradeLevels = [
    { value: "SARL_OPTIMIZED", name: "SARL Optimisée", cost: 2000, multiplier: 1.2, taxRate: 0.20 },
    { value: "HOLDING_SARL", name: "Holding + SARL", cost: 15000, multiplier: 1.4, taxRate: 0.15 },
    { value: "HOLDING_OFFSHORE", name: "Holding + Offshore", cost: 50000, multiplier: 1.7, taxRate: 0.05 }
  ]

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  // Check if holding is unlocked
  if (!holding && userBalance < HOLDING_UNLOCK_THRESHOLD) {
    return (
      <GlassCard className="p-12 text-center">
        <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Holding Verrouillé</h3>
        <p className="text-muted-foreground mb-4">
          La création de holding se débloque à {HOLDING_UNLOCK_THRESHOLD.toLocaleString()}Ø de capital
        </p>
        <div className="p-4 rounded-lg bg-primary/10 inline-block">
          <p className="text-sm text-muted-foreground">Votre capital actuel</p>
          <p className="text-2xl font-bold">{userBalance.toLocaleString()}Ø</p>
          <p className="text-sm text-muted-foreground">
            Il vous manque {(HOLDING_UNLOCK_THRESHOLD - userBalance).toLocaleString()}Ø
          </p>
        </div>
      </GlassCard>
    )
  }

  if (!holding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Holding</h2>
            <p className="text-muted-foreground">Optimisez vos impôts avec une structure holding</p>
          </div>
          <GlassButton onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une Holding
          </GlassButton>
        </div>

        {showCreateForm && (
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4">Créer une Holding</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Nom de la holding</label>
                <GlassInput
                  value={holdingName}
                  onChange={(e) => setHoldingName(e.target.value)}
                  placeholder="Ex: Ma Holding Group"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Structure juridique</label>
                <div className="grid grid-cols-2 gap-3">
                  {legalStructures.map((structure) => (
                    <button
                      key={structure.value}
                      onClick={() => setSelectedStructure(structure.value)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedStructure === structure.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold">{structure.name}</p>
                      <p className="text-sm text-muted-foreground">{structure.cost.toLocaleString()}Ø</p>
                      <p className="text-xs text-green-500">×{structure.multiplier} revenus</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <GlassButton onClick={handleCreate}>
                  Créer ({legalStructures.find(s => s.value === selectedStructure)?.cost.toLocaleString()}Ø)
                </GlassButton>
                <GlassButton variant="secondary" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        )}

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{holding.name}</h2>
          <p className="text-muted-foreground">{holding.legalStructure}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Multiplicateur</span>
          </div>
          <p className="text-2xl font-bold">×{holding.revenueMultiplier}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Taux impôt</span>
          </div>
          <p className="text-2xl font-bold">{(holding.taxRate * 100).toFixed(0)}%</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Capital</span>
          </div>
          <p className="text-2xl font-bold">{Number(holding.capital).toLocaleString()}Ø</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Coût annuel</span>
          </div>
          <p className="text-2xl font-bold">{Number(holding.annualCost).toLocaleString()}Ø</p>
        </GlassCard>
      </div>

      {/* Upgrade Options */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4">Optimisation Fiscale</h3>
        <div className="space-y-3">
          {upgradeLevels.map((level) => {
            const isCurrent = holding.taxOptimizationLevel === level.value
            const isUnlocked = upgradeLevels.findIndex(l => l.value === holding.taxOptimizationLevel) < 
                               upgradeLevels.findIndex(l => l.value === level.value)
            
            return (
              <div
                key={level.value}
                className={`p-4 rounded-lg border ${
                  isCurrent ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{level.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ×{level.multiplier} revenus • {(level.taxRate * 100).toFixed(0)}% impôt
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="text-sm text-green-500 font-medium">Actif</span>
                  ) : isUnlocked ? (
                    <GlassButton onClick={() => handleUpgrade(level.value)} size="sm">
                      Upgrade ({level.cost.toLocaleString()}Ø)
                    </GlassButton>
                  ) : (
                    <span className="text-sm text-muted-foreground">Verrouillé</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Strategies */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4">Stratégies Actives</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: "hasDeductions", label: "Déductions frais" },
            { key: "hasAmortizations", label: "Amortissements accélérés" },
            { key: "hasProvisions", label: "Provisions stocks" },
            { key: "hasTaxCredits", label: "Crédits impôts R&D" },
            { key: "hasOffshore", label: "Structure offshore" },
            { key: "hasTransferPricing", label: "Transfert pricing" }
          ].map((strategy) => (
            <div
              key={strategy.key}
              className={`p-3 rounded-lg border ${
                holding[strategy.key as keyof Holding]
                  ? "border-green-500 bg-green-500/10"
                  : "border-border opacity-50"
              }`}
            >
              <p className="text-sm font-medium">{strategy.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Risks */}
      {(holding.auditRisk > 0 || holding.reputationRisk > 0) && (
        <GlassCard className="p-6 bg-orange-500/10 border-orange-500/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Risques
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Risque audit fiscal</p>
              <p className="text-xl font-bold text-orange-500">{holding.auditRisk}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risque réputation</p>
              <p className="text-xl font-bold text-orange-500">{holding.reputationRisk}%</p>
            </div>
          </div>
        </GlassCard>
      )}

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
