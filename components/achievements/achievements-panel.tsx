"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Trophy, Star, Lock, CheckCircle, TrendingUp, Building2, Wallet } from "lucide-react"

interface Achievement {
  id: string
  number: number
  name: string
  description: string
  category: string
  conditionType: string
  conditionValue: string
  rewardType: string
  rewardValue: string | null
  unlocked: boolean
  progress: number
}

interface AchievementsStats {
  unlocked: number
  total: number
  currentFortune: number
  currentRank: number
  businessCount: number
}

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<AchievementsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")

  const categories = [
    { value: "ALL", label: "Tous" },
    { value: "FORTUNE", label: "Fortune" },
    { value: "FORBES", label: "Forbes" },
    { value: "BUSINESS", label: "Entreprises" },
    { value: "RETAIL", label: "Retail" },
    { value: "TECH", label: "Tech" },
    { value: "CRYPTO", label: "Crypto" }
  ]

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/achievements")
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  const filteredAchievements = selectedCategory === "ALL" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "FORTUNE": return <Wallet className="w-4 h-4" />
      case "FORBES": return <Trophy className="w-4 h-4" />
      case "BUSINESS": return <Building2 className="w-4 h-4" />
      case "TECH": return <Star className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "FORTUNE": return "text-green-500"
      case "FORBES": return "text-purple-500"
      case "BUSINESS": return "text-blue-500"
      case "TECH": return "text-cyan-500"
      case "CRYPTO": return "text-orange-500"
      default: return "text-gray-500"
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "BADGE": return <Star className="w-4 h-4 text-yellow-500" />
      case "BONUS": return <Wallet className="w-4 h-4 text-green-500" />
      case "TITLE": return <Trophy className="w-4 h-4 text-purple-500" />
      case "SKIN": return <Star className="w-4 h-4 text-pink-500" />
      default: return null
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Succès</h2>
          <p className="text-muted-foreground">Débloquez des récompenses en progressant</p>
        </div>
        {stats && (
          <div className="text-right">
            <p className="text-3xl font-bold gradient-text">{stats.unlocked}/{stats.total}</p>
            <p className="text-sm text-muted-foreground">Débloqués</p>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat.value
                ? "bg-primary text-white"
                : "glass-button"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Progress Overview */}
      {stats && (
        <GlassCard className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Fortune</p>
              <p className="text-xl font-bold">{stats.currentFortune.toLocaleString()}\u00D8</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Rang Forbes</p>
              <p className="text-xl font-bold">#{stats.currentRank}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Entreprises</p>
              <p className="text-xl font-bold">{stats.businessCount}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Achievements List */}
      <div className="space-y-3">
        {filteredAchievements.map((achievement) => (
          <GlassCard
            key={achievement.id}
            className={`p-4 ${achievement.unlocked ? "border-green-500/30 bg-green-500/5" : "border-border"}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${achievement.unlocked ? "bg-green-500/20" : "bg-gray-500/20"}`}>
                  {achievement.unlocked ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">#{achievement.number}</span>
                    <h3 className={`font-semibold ${achievement.unlocked ? "text-green-500" : ""}`}>
                      {achievement.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(achievement.category)}
                    <span className={`text-xs ${getCategoryColor(achievement.category)}`}>
                      {achievement.category}
                    </span>
                    {achievement.rewardValue && (
                      <>
                        {getRewardIcon(achievement.rewardType)}
                        <span className="text-xs text-muted-foreground">
                          {achievement.rewardType === "BONUS" ? `+${achievement.rewardValue}\u00D8` : achievement.rewardValue}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {achievement.progress > 0 && !achievement.unlocked && (
                <div className="text-right">
                  <p className="text-sm font-medium">{(achievement.progress * 100).toFixed(0)}%</p>
                  <div className="w-16 h-2 bg-gray-700 rounded-full mt-1">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${achievement.progress * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
