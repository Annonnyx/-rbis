"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Trophy, Crown, Sparkles, Star, TrendingUp, Building2, Wallet } from "lucide-react"

interface Victory {
  id: string
  achievedAt: string
  finalFortune: number
  finalRank: number
  totalPlayTime: number
  businessesOwned: number
  totalTransactions: number
  title: string
  bonusReward: number
}

interface VictoryProgress {
  fortune: { current: number; target: number; progress: number }
  rank: { current: number; target: number; progress: number }
}

export function VictoryScreen() {
  const [victory, setVictory] = useState<Victory | null>(null)
  const [progress, setProgress] = useState<VictoryProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  const checkVictory = async () => {
    try {
      const res = await fetch("/api/victory/check")
      if (res.ok) {
        const data = await res.json()
        if (data.hasVictory) {
          setVictory(data.victory)
          setShowConfetti(true)
        } else {
          setProgress(data.progress)
        }
      }
    } catch (error) {
      console.error("Error checking victory:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkVictory()
    // Check every 30 seconds
    const interval = setInterval(checkVictory, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatFortune = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B\u00D8`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M\u00D8`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k\u00D8`
    return `${value}\u00D8`
  }

  if (loading) {
    return <div className="text-center py-12">Vérification...</div>
  }

  if (victory) {
    return (
      <div className="space-y-6">
        {/* Victory Banner */}
        <GlassCard className="p-8 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-yellow-500/20 border-yellow-500/50">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Crown className="w-16 h-16 text-yellow-500 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">🎉 VICTOIRE !</h1>
            <p className="text-xl text-muted-foreground mb-4">{victory.title}</p>
            <p className="text-sm text-muted-foreground">
              Atteint le {new Date(victory.achievedAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <GlassCard className="p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Fortune Finale</p>
            <p className="text-2xl font-bold">{formatFortune(victory.finalFortune)}</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Rang Final</p>
            <p className="text-2xl font-bold">#{victory.finalRank}</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Wallet className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Bonus Victoire</p>
            <p className="text-2xl font-bold text-green-500">+{formatFortune(victory.bonusReward)}</p>
          </GlassCard>
        </div>

        {/* Detailed Stats */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Statistiques de Carrière
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">Entreprises</p>
              <p className="text-xl font-bold">{victory.businessesOwned}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-xl font-bold">{victory.totalTransactions}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">Temps de jeu</p>
              <p className="text-xl font-bold">{victory.totalPlayTime} min</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50">
              <p className="text-xs text-muted-foreground">Titre</p>
              <p className="text-xl font-bold text-yellow-500">{victory.title}</p>
            </div>
          </div>
        </GlassCard>

        {/* Achievement Badges */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">Succès Débloqués</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Trophy, label: "Top 1 Forbes", color: "text-yellow-500" },
              { icon: TrendingUp, label: "Milliardaire", color: "text-green-500" },
              { icon: Building2, label: "Empire", color: "text-blue-500" },
              { icon: Wallet, label: "Fortune", color: "text-purple-500" },
              { icon: Star, label: "Légende", color: "text-orange-500" },
              { icon: Sparkles, label: "Magnat", color: "text-pink-500" }
            ].map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
              >
                <badge.icon className={`w-4 h-4 ${badge.color}`} />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Continue Button */}
        <GlassCard className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Vous pouvez continuer à jouer pour atteindre des fortunes encore plus élevées !
          </p>
          <GlassButton onClick={() => window.location.href = "/dashboard"}>
            Continuer à jouer
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  if (progress) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Progression vers la Victoire
          </h2>
          <p className="text-muted-foreground mb-6">
            Atteignez 1B\u00D8 de fortune et devenez Top 1 Forbes pour gagner !
          </p>

          <div className="space-y-6">
            {/* Fortune Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Fortune</span>
                <span className="text-sm text-muted-foreground">
                  {formatFortune(progress.fortune.current)} / {formatFortune(progress.fortune.target)}
                </span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progress.fortune.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress.fortune.progress.toFixed(1)}%</p>
            </div>

            {/* Rank Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Rang Forbes</span>
                <span className="text-sm text-muted-foreground">
                  #{progress.rank.current} / #{progress.rank.target}
                </span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progress.rank.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress.rank.progress.toFixed(1)}%</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-semibold mb-3">Conditions de Victoire</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-green-500" />
              Atteindre 1 milliard d'\u00D8 de fortune totale
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-500" />
              Devenir le numéro 1 du classement Forbes
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Récompense: 1.000.000\u00D8 + Titre "Magnat Suprême"
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <GlassCard className="p-12 text-center">
      <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">Chargement de la progression...</p>
    </GlassCard>
  )
}
