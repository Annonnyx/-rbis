"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  Lightbulb, Plus, ThumbsUp, ThumbsDown, MessageSquare,
  Filter, TrendingUp, Clock, CheckCircle2, XCircle,
  ChevronRight, Search, Sparkles, Users
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"

interface Suggestion {
  id: string
  title: string
  description: string
  type: "FEATURE" | "IMPROVEMENT" | "BUG" | "OTHER"
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "IMPLEMENTED"
  votes: number
  userVote: "UP" | "DOWN" | null
  user: {
    id: string
    name: string
    identifier: string
  }
  createdAt: string
  commentsCount: number
}

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

const typeLabels = {
  FEATURE: "Nouvelle fonctionnalité",
  IMPROVEMENT: "Amélioration",
  BUG: "Bug",
  OTHER: "Autre",
}

const typeColors = {
  FEATURE: "bg-blue-500/10 text-blue-500",
  IMPROVEMENT: "bg-green-500/10 text-green-500",
  BUG: "bg-red-500/10 text-red-500",
  OTHER: "bg-gray-500/10 text-gray-500",
}

const statusLabels = {
  PENDING: "En attente",
  UNDER_REVIEW: "En cours d'examen",
  APPROVED: "Approuvée",
  REJECTED: "Rejetée",
  IMPLEMENTED: "Implémentée",
}

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  UNDER_REVIEW: "bg-blue-500/10 text-blue-500",
  APPROVED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-red-500/10 text-red-500",
  IMPLEMENTED: "bg-purple-500/10 text-purple-500",
}

export function SuggestionsClient() {
  const { data: session, status } = useSafeSession()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<"ALL" | "FEATURE" | "IMPROVEMENT" | "BUG">("ALL")
  const [sortBy, setSortBy] = useState<"NEWEST" | "POPULAR">("POPULAR")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "FEATURE" as Suggestion["type"],
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchSuggestions()
    }
  }, [status, filter, sortBy])

  const fetchSuggestions = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== "ALL") params.append("type", filter)
      params.append("sort", sortBy)
      
      const res = await fetch(`/api/suggestions?${params}`)
      if (res.ok) {
        setSuggestions(await res.json())
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchSuggestions()
        setShowCreate(false)
        setFormData({ title: "", description: "", type: "FEATURE" })
      }
    } catch (error) {
      console.error("Error creating suggestion:", error)
    }
  }

  const handleVote = async (suggestionId: string, voteType: "UP" | "DOWN") => {
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: voteType }),
      })
      if (res.ok) {
        fetchSuggestions()
      }
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const filteredSuggestions = suggestions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: suggestions.length,
    pending: suggestions.filter(s => s.status === "PENDING").length,
    implemented: suggestions.filter(s => s.status === "IMPLEMENTED").length,
    myVotes: suggestions.filter(s => s.userVote !== null).length,
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Lightbulb className="w-16 h-16 text-primary/60 animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (showCreate) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Nouvelle suggestion</h1>
            <p className="text-muted-foreground">Partagez votre idée pour améliorer \u00D8rbis</p>
          </div>
        </div>
        
        <form onSubmit={handleCreate} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Type de suggestion</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(typeLabels).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type as Suggestion["type"] })}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      formData.type === type
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mb-2 ${typeColors[type as keyof typeof typeColors]}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <GlassInput
              label="Titre"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Ajouter un système de messagerie"
            />

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Description</label>
              <textarea
                rows={5}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre suggestion en détail..."
                className="w-full px-4 py-3 glass-input rounded-xl resize-none"
              />
            </div>
          </GlassCard>
          
          <div className="flex gap-4">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setShowCreate(false)}
              className="flex-1"
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Soumettre la suggestion
            </GlassButton>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Suggestions</h1>
          <p className="text-muted-foreground">Votez et proposez de nouvelles idées</p>
        </div>
        <GlassButton onClick={() => setShowCreate(true)} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle suggestion
        </GlassButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <Lightbulb className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Suggestions</p>
        </GlassCard>
        <GlassCard className="p-4">
          <Clock className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </GlassCard>
        <GlassCard className="p-4">
          <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.implemented}</p>
          <p className="text-xs text-muted-foreground">Implémentées</p>
        </GlassCard>
        <GlassCard className="p-4">
          <ThumbsUp className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.myVotes}</p>
          <p className="text-xs text-muted-foreground">Mes votes</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl"
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { id: "ALL", label: "Toutes" },
            { id: "FEATURE", label: "Fonctionnalités" },
            { id: "IMPROVEMENT", label: "Améliorations" },
            { id: "BUG", label: "Bugs" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.id
                  ? "bg-primary text-white"
                  : "glass-button"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 glass-input rounded-xl text-sm"
        >
          <option value="POPULAR">Plus populaires</option>
          <option value="NEWEST">Plus récentes</option>
        </select>
      </div>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Aucune suggestion trouvée</p>
          <GlassButton onClick={() => setShowCreate(true)} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Être le premier à suggérer
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <GlassCard key={suggestion.id} className="p-5">
              <div className="flex items-start gap-4">
                {/* Vote Buttons */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleVote(suggestion.id, "UP")}
                    className={`p-2 rounded-lg transition-all ${
                      suggestion.userVote === "UP"
                        ? "bg-primary text-white"
                        : "hover:bg-accent"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className={`font-bold text-lg ${
                    suggestion.votes > 0 ? "text-green-500" : suggestion.votes < 0 ? "text-red-500" : ""
                  }`}>
                    {suggestion.votes > 0 ? "+" : ""}{suggestion.votes}
                  </span>
                  <button
                    onClick={() => handleVote(suggestion.id, "DOWN")}
                    className={`p-2 rounded-lg transition-all ${
                      suggestion.userVote === "DOWN"
                        ? "bg-red-500 text-white"
                        : "hover:bg-accent"
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[suggestion.type]}`}>
                      {typeLabels[suggestion.type]}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[suggestion.status]}`}>
                      {statusLabels[suggestion.status]}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{suggestion.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {suggestion.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{suggestion.user.name} ({suggestion.user.identifier})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(suggestion.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{suggestion.commentsCount} commentaires</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
