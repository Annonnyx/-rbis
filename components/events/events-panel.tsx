"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { AlertTriangle, TrendingUp, Zap, Clock, CheckCircle, XCircle } from "lucide-react"

interface Event {
  id: string
  type: string
  title: string
  description: string
  revenueImpact: number | null
  reputationImpact: number | null
  durationHours: number | null
  isActive: boolean
  playerChoice: string | null
  choiceResult: string | null
  business: {
    id: string
    name: string
  } | null
}

export function EventsPanel() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events")
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleGenerateEvent = async () => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchEvents()
      } else {
        setMessage({ type: "error", text: "Erreur lors de la génération" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    }
  }

  const handleResolveEvent = async (eventId: string, choice: string) => {
    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, choice })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: "success", text: data.message })
        fetchEvents()
      } else {
        setMessage({ type: "error", text: "Erreur lors de la résolution" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "OPPORTUNITY": return <TrendingUp className="w-5 h-5 text-green-500" />
      case "BREAKDOWN": return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case "BUZZ": return <Zap className="w-5 h-5 text-yellow-500" />
      case "CRISIS": return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "SCANDAL": return <XCircle className="w-5 h-5 text-purple-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "OPPORTUNITY": return "border-green-500/30 bg-green-500/10"
      case "BREAKDOWN": return "border-orange-500/30 bg-orange-500/10"
      case "BUZZ": return "border-yellow-500/30 bg-yellow-500/10"
      case "CRISIS": return "border-red-500/30 bg-red-500/10"
      case "SCANDAL": return "border-purple-500/30 bg-purple-500/10"
      default: return "border-gray-500/30 bg-gray-500/10"
    }
  }

  const getChoiceOptions = (type: string) => {
    switch (type) {
      case "OPPORTUNITY":
        return [
          { value: "accept", label: "Accepter", color: "green" },
          { value: "reject", label: "Refuser", color: "gray" }
        ]
      case "BREAKDOWN":
        return [
          { value: "repair", label: "Réparer", color: "blue" },
          { value: "replace", label: "Remplacer", color: "orange" }
        ]
      case "BUZZ":
        return [
          { value: "capitalize", label: "En profiter", color: "green" },
          { value: "ignore", label: "Ignorer", color: "gray" }
        ]
      case "CRISIS":
        return [
          { value: "cut_costs", label: "Réduire coûts", color: "red" },
          { value: "invest_marketing", label: "Investir marketing", color: "blue" }
        ]
      case "SCANDAL":
        return [
          { value: "deny", label: "Nier", color: "red" },
          { value: "apologize", label: "S'excuser", color: "green" },
          { value: "investigate", label: "Enquêter", color: "blue" }
        ]
      default:
        return []
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Événements</h2>
          <p className="text-muted-foreground">Gérez les opportunités et crises</p>
        </div>
        <GlassButton onClick={handleGenerateEvent}>
          <Zap className="w-4 h-4 mr-2" />
          Générer Événement
        </GlassButton>
      </div>

      {events.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun événement actif</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <GlassCard key={event.id} className={`p-6 ${getEventColor(event.type)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    {event.business && (
                      <p className="text-sm text-muted-foreground">{event.business.name}</p>
                    )}
                  </div>
                </div>
                {event.isActive ? (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                    Actif
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-500 text-sm font-medium">
                    Résolu
                  </span>
                )}
              </div>

              <p className="text-sm mb-4">{event.description}</p>

              {event.revenueImpact && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Impact revenu:</span>
                  <span className={`font-semibold ${event.revenueImpact > 0 ? "text-green-500" : "text-red-500"}`}>
                    {event.revenueImpact > 0 ? "+" : ""}{(event.revenueImpact * 100).toFixed(0)}%
                  </span>
                </div>
              )}

              {event.reputationImpact && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Impact réputation:</span>
                  <span className={`font-semibold ${event.reputationImpact > 0 ? "text-green-500" : "text-red-500"}`}>
                    {event.reputationImpact > 0 ? "+" : ""}{event.reputationImpact}
                  </span>
                </div>
              )}

              {event.durationHours && event.isActive && (
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Durée: {event.durationHours}h
                  </span>
                </div>
              )}

              {event.isActive ? (
                <div className="flex gap-2">
                  {getChoiceOptions(event.type).map((choice) => (
                    <GlassButton
                      key={choice.value}
                      onClick={() => handleResolveEvent(event.id, choice.value)}
                      size="sm"
                      className="flex-1"
                    >
                      {choice.label}
                    </GlassButton>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">
                    Résolu: {event.choiceResult}
                  </span>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
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
