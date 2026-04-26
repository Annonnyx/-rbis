"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { FlaskConical, Lightbulb, Award, Zap, Truck, Leaf, Clock, CheckCircle } from "lucide-react"

interface Technology {
  id: string
  name: string
  description: string
  category: string
  level: number
  maxLevel: number
  researchCost: number
  researchTime: number
  progress: number
  startedAt: string
  completedAt: string | null
}

interface Patent {
  id: string
  name: string
  industry: string
  marketValue: number
  licensingRevenue: number
  expiresAt: string
}

const CATEGORY_ICONS: Record<string, any> = {
  PRODUCT: Lightbulb,
  PROCESS: Zap,
  MARKETING: Award,
  LOGISTICS: Truck,
  SUSTAINABILITY: Leaf
}

const CATEGORY_NAMES: Record<string, string> = {
  PRODUCT: "Produit",
  PROCESS: "Process",
  MARKETING: "Marketing",
  LOGISTICS: "Logistique",
  SUSTAINABILITY: "Durabilité"
}

export function TechnologyPanel() {
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [patents, setPatents] = useState<Patent[]>([])
  const [availableTechs, setAvailableTechs] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("PRODUCT")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchTechnologies = async () => {
    try {
      const res = await fetch("/api/technologies")
      if (res.ok) {
        const data = await res.json()
        setTechnologies(data.technologies)
        setPatents(data.patents)
        setAvailableTechs(data.availableTechs)
      }
    } catch (error) {
      console.error("Error fetching technologies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechnologies()
  }, [])

  const startResearch = async (category: string, index: number) => {
    try {
      const res = await fetch("/api/technologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, techIndex: index })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchTechnologies()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du démarrage de la recherche" })
    }
  }

  const completeResearch = async (techId: string) => {
    try {
      const res = await fetch("/api/technologies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technologyId: techId })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchTechnologies()
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur" })
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
            <FlaskConical className="w-6 h-6 text-purple-500" />
            R&D et Technologies
          </h2>
          <p className="text-muted-foreground">{technologies.length} recherches actives, {patents.length} brevets</p>
        </div>
      </div>

      {/* Patents Section */}
      {patents.length > 0 && (
        <GlassCard className="p-6 border-yellow-500/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Brevets Actifs
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {patents.map((patent) => (
              <div key={patent.id} className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="font-semibold">{patent.name}</p>
                <p className="text-sm text-muted-foreground">{patent.industry}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Valeur: {patent.marketValue.toLocaleString()}\u00D8</span>
                  <span>Licences: {patent.licensingRevenue.toLocaleString()}\u00D8/an</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Active Research */}
      {technologies.filter(t => !t.completedAt).length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Recherches en Cours</h3>
          <div className="space-y-4">
            {technologies.filter(t => !t.completedAt).map((tech) => (
              <div key={tech.id} className="p-4 rounded-lg bg-primary/10">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">{tech.name}</p>
                  <span className="text-sm">Niveau {tech.level}/{tech.maxLevel}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{tech.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{(tech.progress * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${tech.progress * 100}%` }}
                    />
                  </div>
                </div>
                {/* Debug button - in production this would be time-based */}
                <GlassButton size="sm" onClick={() => completeResearch(tech.id)} className="mt-3">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Compléter (Debug)
                </GlassButton>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Available Technologies */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4">Nouvelles Recherches</h3>
        
        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {Object.keys(CATEGORY_NAMES).map((cat) => {
            const Icon = CATEGORY_ICONS[cat]
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "glass-button"
                }`}
              >
                <Icon className="w-4 h-4" />
                {CATEGORY_NAMES[cat]}
              </button>
            )
          })}
        </div>

        {/* Tech Tree */}
        <div className="space-y-3">
          {availableTechs[selectedCategory]?.map((tech, index) => {
            const isResearching = technologies.some(t => t.name === tech.name && !t.completedAt)
            const isCompleted = technologies.some(t => t.name === tech.name && t.completedAt)
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isCompleted
                    ? "border-green-500/30 bg-green-500/10"
                    : isResearching
                    ? "border-yellow-500/30 bg-yellow-500/10"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-semibold ${isCompleted ? "text-green-500" : ""}`}>
                      {tech.name}
                      {isCompleted && " ✓"}
                    </p>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {24 * tech.maxLevel}h
                      </span>
                      <span>Max niveau: {tech.maxLevel}</span>
                    </div>
                  </div>
                  {!isResearching && !isCompleted && (
                    <GlassButton size="sm" onClick={() => startResearch(selectedCategory, index)}>
                      {tech.baseCost.toLocaleString()}\u00D8
                    </GlassButton>
                  )}
                  {isResearching && (
                    <span className="text-sm text-yellow-500">En cours...</span>
                  )}
                  {isCompleted && (
                    <span className="text-sm text-green-500">Débloqué</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
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
