"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, MousePointerClick } from "lucide-react"

interface TutorialStep {
  id: string
  title: string
  description: string
  target: string // CSS selector for the element to highlight
  targetPage?: string // Route where this step should appear
  action?: "click" | "hover" | "scroll" | "type" | "none"
  actionTarget?: string // Element user must interact with
  tooltipPosition?: "top" | "bottom" | "left" | "right" | "center"
  allowClickThrough?: boolean // Whether user can click the highlighted element
  nextButton?: boolean // Show next button or wait for action
  prevButton?: boolean
  skipable?: boolean
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "👋 Bienvenue à Ørbis !",
    description: "Commençons votre aventure entrepreneuriale. Je vais vous guider à travers les fonctionnalités essentielles.",
    target: "body",
    tooltipPosition: "center",
    nextButton: true,
    skipable: true
  },
  {
    id: "dashboard-nav",
    title: "📊 Votre Tableau de Bord",
    description: "Cliquez sur 'Tableau de bord' dans la navigation pour voir votre fortune et votre classement Forbes.",
    target: "a[href*='dashboard']",
    targetPage: "/",
    action: "click",
    actionTarget: "a[href*='dashboard']",
    tooltipPosition: "bottom",
    allowClickThrough: true,
    nextButton: false
  },
  {
    id: "fortune-card",
    title: "💰 Votre Fortune",
    description: "Cette carte montre votre solde total. Vous commencez avec 500Ø. Objectif : atteindre 1 milliard !",
    target: "[data-tutorial='fortune']",
    targetPage: "/dashboard",
    tooltipPosition: "right",
    nextButton: true
  },
  {
    id: "forbes-ranking",
    title: "🏆 Classement Forbes",
    description: "Votre objectif est d'atteindre le rang #1. Plus vous êtes riche, plus vous montez dans le classement !",
    target: "[data-tutorial='forbes']",
    targetPage: "/dashboard",
    tooltipPosition: "left",
    nextButton: true
  },
  {
    id: "mini-games",
    title: "🎮 Mini-Jeux",
    description: "Pour démarrer, gagnez de l'argent avec les mini-jeux. Cliquez ici pour y accéder !",
    target: "a[href='/start']",
    targetPage: "/dashboard",
    action: "click",
    actionTarget: "a[href='/start']",
    tooltipPosition: "bottom",
    allowClickThrough: true,
    nextButton: false
  },
  {
    id: "play-minigame",
    title: "🕹️ Jouez pour Gagner",
    description: "Sélectionnez un mini-jeu et jouez pour gagner des Ørbis. Chaque jeu coûte de l'énergie mais rapporte de l'argent !",
    target: "[data-tutorial='minigame-list']",
    targetPage: "/start",
    tooltipPosition: "center",
    nextButton: true
  },
  {
    id: "business-nav",
    title: "🏢 Créer votre Entreprise",
    description: "Une fois que vous avez 3000Ø, créez votre entreprise. Cliquez sur 'Entreprises' dans le menu.",
    target: "a[href*='business']",
    targetPage: "/start",
    action: "click",
    actionTarget: "a[href*='business']",
    tooltipPosition: "bottom",
    allowClickThrough: true,
    nextButton: false
  },
  {
    id: "create-business",
    title: "🚀 Lancer votre Business",
    description: "Cliquez sur 'Créer votre entreprise' pour commencer. Choisissez un type, un emplacement, et lancez-vous !",
    target: "[data-tutorial='create-business']",
    targetPage: "/business",
    action: "click",
    actionTarget: "[data-tutorial='create-business']",
    tooltipPosition: "center",
    allowClickThrough: true,
    nextButton: false
  },
  {
    id: "business-tabs",
    title: "📑 Gestion Complète",
    description: "Votre entreprise a plusieurs onglets : Ventes, Produits, Équipe, R&D, B2B, Franchises... Explorez-les !",
    target: "[data-tutorial='business-tabs']",
    targetPage: "/business",
    tooltipPosition: "bottom",
    nextButton: true
  },
  {
    id: "market-nav",
    title: "📈 Trading & Bourse",
    description: "Investissez en bourse et tradez des cryptos pour diversifier vos revenus. Allez sur le Marché !",
    target: "a[href*='market']",
    targetPage: "/business",
    action: "click",
    actionTarget: "a[href*='market']",
    tooltipPosition: "bottom",
    allowClickThrough: true,
    nextButton: false
  },
  {
    id: "stocks",
    title: "💹 Actions & Crypto",
    description: "Achetez des actions et des cryptomonnaies. Le trading peut rapporter gros... ou faire perdre !",
    target: "[data-tutorial='stocks-list']",
    targetPage: "/market",
    tooltipPosition: "center",
    nextButton: true
  },
  {
    id: "map-nav",
    title: "🗺️ Carte Interactive",
    description: "Explorez la carte pour voir les zones économiques. Chaque quartier a ses avantages !",
    target: "a[href*='map']",
    targetPage: "/market",
    action: "click",
    actionTarget: "a[href*='map']",
    tooltipPosition: "bottom",
    allowClickThrough: true,
    nextButton: false
  },
  {
    id: "complete",
    title: "🎉 Vous êtes prêt !",
    description: "Vous connaissez maintenant les bases. Votre objectif : devenir le N°1 du classement Forbes avec 1 milliard d'Ø ! Bonne chance !",
    target: "body",
    tooltipPosition: "center",
    nextButton: true,
    skipable: true
  }
]

interface TutorialContextType {
  currentStep: number
  isActive: boolean
  startTutorial: () => void
  skipTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  completeStep: () => void
}

const TutorialContext = createContext<TutorialContextType | null>(null)

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) throw new Error("useTutorial must be used within TutorialProvider")
  return context
}

export function InteractiveTutorialProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null)
  const [currentPath, setCurrentPath] = useState("")
  const [tutorialChecked, setTutorialChecked] = useState(false)

  useEffect(() => {
    // Check tutorial status from API (user-specific, not localStorage)
    if (typeof window === 'undefined') return
    
    const checkTutorialStatus = async () => {
      try {
        const res = await fetch("/api/tutorial")
        if (res.ok) {
          const data = await res.json()
          // Only show tutorial if not completed and not skipped
          if (data.tutorial && 
              data.tutorial.currentStep !== "COMPLETED" && 
              !data.tutorial.skipped) {
            setTimeout(() => setIsActive(true), 1000)
          }
        }
      } catch (error) {
        console.error("Error checking tutorial status:", error)
      } finally {
        setTutorialChecked(true)
      }
    }
    
    checkTutorialStatus()
    setCurrentPath(window.location.pathname)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener("popstate", handleRouteChange)
    return () => window.removeEventListener("popstate", handleRouteChange)
  }, [])

  useEffect(() => {
    if (!isActive || typeof window === 'undefined' || typeof document === 'undefined') return

    const step = TUTORIAL_STEPS[currentStep]
    if (!step) return

    // Wait for element to be in DOM
    const findTarget = () => {
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetElement(rect)
        
        // Scroll to element if needed
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }

    const timer = setTimeout(findTarget, 500)
    return () => clearTimeout(timer)
  }, [currentStep, isActive, currentPath])

  const startTutorial = useCallback(async () => {
    setCurrentStep(0)
    setIsActive(true)
    // Reset tutorial status via API
    try {
      await fetch("/api/tutorial", { method: "PATCH" })
    } catch (error) {
      console.error("Error resetting tutorial:", error)
    }
  }, [])

  const skipTutorial = useCallback(async () => {
    setIsActive(false)
    // Mark tutorial as skipped via API
    try {
      await fetch("/api/tutorial", { method: "PUT" })
    } catch (error) {
      console.error("Error skipping tutorial:", error)
    }
  }, [])

  const nextStep = useCallback(async () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      // Advance tutorial step via API
      try {
        await fetch("/api/tutorial", { method: "POST" })
      } catch (error) {
        console.error("Error advancing tutorial:", error)
      }
    } else {
      setIsActive(false)
      // Complete tutorial via API
      try {
        await fetch("/api/tutorial", { method: "POST" })
      } catch (error) {
        console.error("Error completing tutorial:", error)
      }
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const completeStep = useCallback(() => {
    nextStep()
  }, [nextStep])

  const step = TUTORIAL_STEPS[currentStep]

  return (
    <TutorialContext.Provider value={{
      currentStep,
      isActive,
      startTutorial,
      skipTutorial,
      nextStep,
      prevStep,
      completeStep
    }}>
      {children}
      
      <AnimatePresence>
        {isActive && step && (
          <InteractiveTutorialOverlay
            step={step}
            targetRect={targetElement}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTutorial}
            currentStep={currentStep}
            totalSteps={TUTORIAL_STEPS.length}
          />
        )}
      </AnimatePresence>
    </TutorialContext.Provider>
  )
}

interface OverlayProps {
  step: TutorialStep
  targetRect: DOMRect | null
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  currentStep: number
  totalSteps: number
}

function InteractiveTutorialOverlay({
  step,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  currentStep,
  totalSteps
}: OverlayProps) {
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!targetRect) return

    const padding = 20
    let x = targetRect.left + targetRect.width / 2
    let y = targetRect.top + targetRect.height / 2

    switch (step.tooltipPosition) {
      case "top":
        y = targetRect.top - padding
        break
      case "bottom":
        y = targetRect.bottom + padding
        break
      case "left":
        x = targetRect.left - padding
        break
      case "right":
        x = targetRect.right + padding
        break
      case "center":
        x = window.innerWidth / 2
        y = window.innerHeight / 2
        break
    }

    setTooltipPos({ x, y })
  }, [targetRect, step.tooltipPosition])

  // Handle click on target
  useEffect(() => {
    if (!step.allowClickThrough || !step.actionTarget) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(step.actionTarget!)) {
        // Small delay to let the navigation happen
        setTimeout(onNext, 300)
      }
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [step, onNext])

  const isCenter = step.tooltipPosition === "center"

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998]"
        style={{
          background: targetRect && !isCenter
            ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, 
                transparent 0px, 
                transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20}px, 
                rgba(0, 0, 0, 0.85) ${Math.max(targetRect.width, targetRect.height) / 2 + 80}px)`
            : "rgba(0, 0, 0, 0.85)"
        }}
        onClick={step.allowClickThrough ? undefined : onSkip}
      />

      {/* Highlight box around target */}
      {targetRect && !isCenter && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.4)",
            borderRadius: "12px"
          }}
        >
          {/* Pulsing animation */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0px rgba(99, 102, 241, 0.4)",
                "0 0 0 20px rgba(99, 102, 241, 0)",
                "0 0 0 0px rgba(99, 102, 241, 0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl"
          />
        </motion.div>
      )}

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`fixed z-[10000] max-w-sm ${isCenter ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : ""}`}
        style={!isCenter ? {
          left: tooltipPos.x,
          top: tooltipPos.y,
          transform: `translate(${step.tooltipPosition === "left" ? "-100%" : step.tooltipPosition === "right" ? "0%" : "-50%"}, 
                               ${step.tooltipPosition === "top" ? "-100%" : step.tooltipPosition === "bottom" ? "0%" : "-50%"})`
        } : undefined}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Étape {currentStep + 1}/{totalSteps}</span>
              <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
            {step.skipable && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
            {step.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
            {step.description}
          </p>

          {/* Action hint */}
          {step.action && step.action !== "none" && (
            <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-4">
              <MousePointerClick className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {step.action === "click" && "Cliquez sur l'élément surligné"}
                {step.action === "hover" && "Survolez l'élément"}
                {step.action === "scroll" && "Faites défiler la page"}
                {step.action === "type" && "Tapez quelque chose"}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {step.prevButton !== false && currentStep > 0 && (
                <button
                  onClick={onPrev}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
              )}
            </div>
            
            {step.nextButton !== false && (
              <button
                onClick={onNext}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                {currentStep === totalSteps - 1 ? "Terminer" : "Suivant"}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
