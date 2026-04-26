"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"

interface MiniGame {
  type: string
  name: string
  minEarnings: number
  maxEarnings: number
  energyCost: number
  duration: number
  icon: string
}

const MINI_GAMES: MiniGame[] = [
  {
    type: "DELIVERY_WALKING",
    name: "Livraison à pied",
    minEarnings: 50,
    maxEarnings: 150,
    energyCost: 15,
    duration: 120,
    icon: "🚶"
  },
  {
    type: "URBAN_TASKS",
    name: "Courses urbaines",
    minEarnings: 80,
    maxEarnings: 200,
    energyCost: 20,
    duration: 180,
    icon: "🏃"
  },
  {
    type: "DELIVERY_BIKE",
    name: "Livraison vélo",
    minEarnings: 150,
    maxEarnings: 400,
    energyCost: 25,
    duration: 300,
    icon: "🚴"
  },
  {
    type: "STREET_VENDOR",
    name: "Vendeur ambulant",
    minEarnings: 200,
    maxEarnings: 500,
    energyCost: 30,
    duration: 240,
    icon: "📢"
  },
  {
    type: "FREELANCE_DIGITAL",
    name: "Freelance digital",
    minEarnings: 300,
    maxEarnings: 600,
    energyCost: 35,
    duration: 360,
    icon: "💻"
  },
  {
    type: "DRIVER_VTC",
    name: "Chauffeur VTC",
    minEarnings: 400,
    maxEarnings: 800,
    energyCost: 40,
    duration: 300,
    icon: "🚗"
  }
]

interface PlayerStats {
  energy: {
    current: number
    max: number
  }
  miniGames: {
    earnings: number
    cap: number
    capReached: boolean
    remaining: number
  }
}

export function MiniGamesPanel() {
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/player/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const playMiniGame = async (game: MiniGame) => {
    if (stats?.miniGames.capReached) {
      setMessage({
        type: "error",
        text: "Vous avez atteint le maximum de 2000\u00D8 via mini-jeux. Créez une entreprise pour continuer !"
      })
      setTimeout(() => setMessage(null), 5000)
      return
    }

    if (stats?.energy.current && stats.energy.current < game.energyCost) {
      setMessage({
        type: "error",
        text: `Il vous faut ${game.energyCost} points d'énergie. Achetez de la nourriture au shop !`
      })
      setTimeout(() => setMessage(null), 5000)
      return
    }

    setLoading(true)
    setActiveGame(game.type)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + (100 / (game.duration / 10))
      })
    }, 100)

    try {
      const response = await fetch("/api/minigames/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: game.type })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: "success",
          text: `+${data.earnings}\u00D8 gagnés ! ${data.capReached ? "Plafond atteint !" : ""}`
        })
        fetchStats()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({
          type: "error",
          text: data.message
        })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Impossible de jouer au mini-jeu"
      })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setLoading(false)
      setActiveGame(null)
      setProgress(0)
    }
  }

  if (!stats) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      {/* Message Alert */}
      {message && (
        <GlassCard className={`p-3 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.type === 'success' ? '🎉' : '⚠️'} {message.text}
          </p>
        </GlassCard>
      )}

      {/* Energy & Progress Bar */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">⚡ Énergie</span>
          <span className="text-sm">{stats.energy.current} / {stats.energy.max}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(stats.energy.current / stats.energy.max) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">💰 Gains Mini-Jeux</span>
          <span className="text-sm">{stats.miniGames.earnings} / {stats.miniGames.cap} \u00D8</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              stats.miniGames.capReached ? 'bg-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'
            }`}
            style={{ width: `${(stats.miniGames.earnings / stats.miniGames.cap) * 100}%` }}
          ></div>
        </div>
        {stats.miniGames.capReached && (
          <p className="text-xs text-red-400 mt-2 text-center">
            🚫 Plafond atteint ! Passez aux entreprises pour des revenus illimités \u00D8/h
          </p>
        )}
        {!stats.miniGames.capReached && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Encore {stats.miniGames.remaining}\u00D8 disponibles via mini-jeux
          </p>
        )}
      </GlassCard>

      {/* Active Game Progress */}
      {activeGame && (
        <GlassCard className="p-4 border-yellow-500/50">
          <div className="text-center">
            <p className="text-sm mb-2">⏳ Mini-jeu en cours...</p>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Mini Games Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {MINI_GAMES.map((game) => {
          const canPlay = !stats.miniGames.capReached && stats.energy.current >= game.energyCost
          
          return (
            <GlassCard 
              key={game.type}
              className={`p-4 transition-all duration-200 ${
                canPlay ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              } ${activeGame === game.type ? 'border-yellow-500' : ''}`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{game.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{game.name}</h3>
                <p className="text-xs text-gray-400 mb-2">
                  {game.minEarnings}-{game.maxEarnings} \u00D8
                </p>
                <div className="flex items-center justify-center gap-2 text-xs mb-3">
                  <span className="text-red-400">-{game.energyCost} ⚡</span>
                  <span className="text-gray-500">{Math.floor(game.duration / 60)} min</span>
                </div>
                <GlassButton
                  onClick={() => playMiniGame(game)}
                  disabled={!canPlay || loading || activeGame !== null}
                  className="w-full text-xs py-2"
                  variant="primary"
                >
                  {activeGame === game.type ? "En cours..." : "Jouer"}
                </GlassButton>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
