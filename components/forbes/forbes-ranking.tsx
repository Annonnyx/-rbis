"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Trophy, TrendingUp, TrendingDown, Crown, Medal } from "lucide-react"

interface ForbesCharacter {
  rank: number
  name: string
  fortune: number
  company: string
  sector: string
  isPlayer?: boolean
}

interface ForbesRanking {
  currentRank: number
  previousRank: number
  rankTier: string
  totalFortune: number
  cash: number
  stocks: number
  crypto: number
  businessValue: number
  rankChange: number
  fortuneChange: number
}

export function ForbesRanking() {
  const [ranking, setRanking] = useState<ForbesRanking | null>(null)
  const [fullRanking, setFullRanking] = useState<ForbesCharacter[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRanking = async () => {
    try {
      const res = await fetch("/api/forbes")
      if (res.ok) {
        const data = await res.json()
        setRanking(data.ranking)
        setFullRanking(data.fullRanking)
      }
    } catch (error) {
      console.error("Error fetching Forbes ranking:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRanking()
    // Refresh every 5 minutes
    const interval = setInterval(fetchRanking, 300000)
    return () => clearInterval(interval)
  }, [])

  const formatFortune = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}BØ`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}MØ`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}kØ`
    return `${value}Ø`
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return null
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "NUMBER_1": return "text-yellow-500"
      case "TOP_10": return "text-purple-500"
      case "TOP_25": return "text-blue-500"
      case "MID_50": return "text-green-500"
      case "BOTTOM_100": return "text-orange-500"
      default: return "text-gray-500"
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement du classement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Player Stats */}
      {ranking && (
        <GlassCard className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Votre Classement Forbes</h2>
              <p className={`text-lg font-semibold ${getTierColor(ranking.rankTier)}`}>
                Rang #{ranking.currentRank}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Fortune totale</p>
              <p className="text-3xl font-bold gradient-text">{formatFortune(ranking.totalFortune)}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">Cash</p>
              <p className="font-semibold">{formatFortune(ranking.cash)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">Actions</p>
              <p className="font-semibold">{formatFortune(ranking.stocks)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">Crypto</p>
              <p className="font-semibold">{formatFortune(ranking.crypto)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">Entreprises</p>
              <p className="font-semibold">{formatFortune(ranking.businessValue)}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <div className={`flex items-center gap-2 ${ranking.rankChange > 0 ? "text-green-500" : ranking.rankChange < 0 ? "text-red-500" : "text-gray-500"}`}>
              {ranking.rankChange > 0 ? <TrendingUp className="w-4 h-4" /> : ranking.rankChange < 0 ? <TrendingDown className="w-4 h-4" /> : null}
              <span className="text-sm">
                {ranking.rankChange !== 0 ? `${Math.abs(ranking.rankChange)} places` : "Stable"}
              </span>
            </div>
            <div className={`flex items-center gap-2 ${ranking.fortuneChange > 0 ? "text-green-500" : ranking.fortuneChange < 0 ? "text-red-500" : "text-gray-500"}`}>
              {ranking.fortuneChange > 0 ? <TrendingUp className="w-4 h-4" /> : ranking.fortuneChange < 0 ? <TrendingDown className="w-4 h-4" /> : null}
              <span className="text-sm">
                {ranking.fortuneChange !== 0 ? formatFortune(ranking.fortuneChange) : "Stable"}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Full Ranking */}
      <GlassCard className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top 20 Forbes Ørbis
        </h3>
        <div className="space-y-2">
          {fullRanking.map((character) => (
            <div
              key={character.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${
                character.isPlayer
                  ? "bg-primary/20 border border-primary"
                  : "bg-background/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 text-center font-bold">
                  {getRankIcon(character.rank) || character.rank}
                </div>
                <div>
                  <p className={`font-semibold ${character.isPlayer ? "text-primary" : ""}`}>
                    {character.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{character.company}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatFortune(character.fortune)}</p>
                <p className="text-xs text-muted-foreground">{character.sector}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
