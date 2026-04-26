"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { X, ChevronRight, ChevronLeft, MapPin, Wallet, Building2, TrendingUp, Trophy, Bitcoin, Briefcase } from "lucide-react"

interface TutorialStep {
  step: string
  title: string
  description: string
}

export function TutorialOverlay() {
  const [tutorial, setTutorial] = useState<any>(null)
  const [currentStepInfo, setCurrentStepInfo] = useState<TutorialStep | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTutorial = async () => {
    try {
      const res = await fetch("/api/tutorial")
      if (res.ok) {
        const data = await res.json()
        setTutorial(data.tutorial)
        setCurrentStepInfo(data.currentStepInfo)
        // Show if not completed and not skipped
        if (!data.tutorial?.skipped && data.tutorial?.currentStep !== "COMPLETED") {
          setShowTutorial(true)
        }
      }
    } catch (error) {
      console.error("Error fetching tutorial:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTutorial()
  }, [])

  const advanceStep = async () => {
    try {
      const res = await fetch("/api/tutorial", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setTutorial(data.tutorial)
        setCurrentStepInfo(data.nextStepInfo)
        if (data.tutorial.currentStep === "COMPLETED") {
          setShowTutorial(false)
        }
      }
    } catch (error) {
      console.error("Error advancing tutorial:", error)
    }
  }

  const skipTutorial = async () => {
    try {
      await fetch("/api/tutorial", { method: "PUT" })
      setShowTutorial(false)
    } catch (error) {
      console.error("Error skipping tutorial:", error)
    }
  }

  if (loading || !showTutorial || !currentStepInfo) {
    return null
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case "MAP_DISCOVERY": return <MapPin className="w-8 h-8 text-blue-500" />
      case "FIRST_MINIGAME": return <Wallet className="w-8 h-8 text-green-500" />
      case "FIRST_BUSINESS": return <Building2 className="w-8 h-8 text-primary" />
      case "STOCK_MARKET": return <TrendingUp className="w-8 h-8 text-purple-500" />
      case "CRYPTO_UNLOCKED": return <Bitcoin className="w-8 h-8 text-orange-500" />
      case "HOLDING_UNLOCKED": return <Briefcase className="w-8 h-8 text-yellow-500" />
      case "VICTORY_CONDITIONS": return <Trophy className="w-8 h-8 text-yellow-500" />
      default: return <div className="w-8 h-8 rounded-full bg-primary/20" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg p-6 relative">
        <button
          onClick={() => setShowTutorial(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-accent"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            {getStepIcon(tutorial.currentStep)}
          </div>
          <h2 className="text-2xl font-bold mb-2">{currentStepInfo.title}</h2>
          <p className="text-muted-foreground">{currentStepInfo.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progression du tutoriel</span>
            <span>{tutorial.stepsCompleted}/{tutorial.totalSteps}</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(tutorial.stepsCompleted / tutorial.totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <GlassButton variant="secondary" onClick={skipTutorial} className="flex-1">
            Passer le tutoriel
          </GlassButton>
          <GlassButton onClick={advanceStep} className="flex-1">
            {tutorial.currentStep === "VICTORY_CONDITIONS" ? "Terminer" : "Continuer"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  )
}
