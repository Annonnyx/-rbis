"use client"

import { MiniGamesPanel } from "@/components/minigames/mini-games-panel"
import { GlassCard } from "@/components/ui/glass-card"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function StartPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">🚀 Phase 1 - Démarrage</h1>
      <p className="text-muted-foreground mb-8">
        Gagnez votre capital de départ avec les mini-jeux (plafond 2000Ø)
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Mini games */}
        <div className="lg:col-span-2" data-tutorial="minigame-list">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">🎮 Mini-Jeux</h2>
            <MiniGamesPanel />
          </GlassCard>
        </div>

        {/* Right column - Info */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">📋 Objectif</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Capital de départ : 500Ø</li>
              <li>• Plafond mini-jeux : 2000Ø</li>
              <li>• Énergie max : 100 pts</li>
              <li>• Régénération : 20 pts/h</li>
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">🛒 Boutique</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Achetez de la nourriture pour restaurer votre énergie
            </p>
            <ul className="space-y-1 text-xs">
              <li>🥪 Sandwich (+40⚡) - 20Ø</li>
              <li>☕ Café (+25⚡) - 15Ø</li>
              <li>⚡ Boisson énergisante (+80⚡) - 50Ø</li>
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold mb-3">🏢 Prochaine étape</h3>
            <p className="text-sm text-muted-foreground">
              Une fois le plafond atteint, créez votre première entreprise pour des revenus passifs Ø/h
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
