import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { TutorialStep } from "@prisma/client"

const TUTORIAL_STEPS = [
  { step: TutorialStep.WELCOME, title: "Bienvenue à \u00D8rbis", description: "Commencez votre aventure entrepreneuriale avec 500\u00D8" },
  { step: TutorialStep.MAP_DISCOVERY, title: "Découvrez la carte", description: "Explorez les zones économiques de la ville" },
  { step: TutorialStep.FIRST_MINIGAME, title: "Premiers revenus", description: "Gagnez de l'argent avec les mini-jeux" },
  { step: TutorialStep.ENERGY_SYSTEM, title: "Système d'énergie", description: "Gérez votre énergie pour maximiser vos gains" },
  { step: TutorialStep.FIRST_BUSINESS, title: "Créez votre entreprise", description: "Investissez 300\u00D8 pour lancer votre affaire" },
  { step: TutorialStep.BUSINESS_TYPES, title: "Types d'entreprises", description: "Choisissez parmi 7 secteurs différents" },
  { step: TutorialStep.LOCATION_CHOICE, title: "Emplacement", description: "Le placement affecte vos revenus" },
  { step: TutorialStep.DA_POSITIONING, title: "Direction Artistique", description: "Positionnez votre marque sur le marché" },
  { step: TutorialStep.HIRING_EMPLOYEE, title: "Recrutement", description: "Embauchez votre premier employé" },
  { step: TutorialStep.STOCK_MARKET, title: "Bourse", description: "Investissez en bourse pour diversifier" },
  { step: TutorialStep.CRYPTO_UNLOCKED, title: "Crypto débloquée", description: "Tradez des cryptomonnaies" },
  { step: TutorialStep.HOLDING_UNLOCKED, title: "Holding", description: "Créez une holding à 100k\u00D8" },
  { step: TutorialStep.VICTORY_CONDITIONS, title: "Objectif final", description: "Atteignez 1B\u00D8 et devenez Top 1 Forbes" },
  { step: TutorialStep.COMPLETED, title: "Tutoriel terminé", description: "Vous maîtrisez les bases d'\u00D8rbis" }
]

// GET /api/tutorial - Get user's tutorial progress
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    let tutorial = await db.tutorial.findUnique({
      where: { userId: session.user.id }
    })

    if (!tutorial) {
      tutorial = await db.tutorial.create({
        data: {
          userId: session.user.id,
          currentStep: TutorialStep.WELCOME,
          totalSteps: TUTORIAL_STEPS.length,
          stepsCompleted: 0
        }
      })
    }

    const currentStepInfo = TUTORIAL_STEPS.find(s => s.step === tutorial.currentStep)

    return NextResponse.json({
      tutorial,
      currentStepInfo,
      allSteps: TUTORIAL_STEPS,
      progress: Math.round((tutorial.stepsCompleted / tutorial.totalSteps) * 100)
    })
  } catch (error) {
    console.error("Error fetching tutorial:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/tutorial/advance - Complete current step and advance
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const tutorial = await db.tutorial.findUnique({
      where: { userId: session.user.id }
    })

    if (!tutorial) {
      return new NextResponse("Tutorial not found", { status: 404 })
    }

    if (tutorial.skipped || tutorial.currentStep === TutorialStep.COMPLETED) {
      return NextResponse.json({ message: "Tutorial already completed or skipped" })
    }

    const stepOrder = Object.values(TutorialStep)
    const currentIndex = stepOrder.indexOf(tutorial.currentStep)
    const nextStep = stepOrder[currentIndex + 1] || TutorialStep.COMPLETED

    const updatedTutorial = await db.tutorial.update({
      where: { userId: session.user.id },
      data: {
        currentStep: nextStep,
        completedSteps: { push: tutorial.currentStep },
        stepsCompleted: tutorial.stepsCompleted + 1
      }
    })

    const nextStepInfo = TUTORIAL_STEPS.find(s => s.step === nextStep)

    return NextResponse.json({
      success: true,
      tutorial: updatedTutorial,
      nextStepInfo,
      progress: Math.round((updatedTutorial.stepsCompleted / updatedTutorial.totalSteps) * 100)
    })
  } catch (error) {
    console.error("Error advancing tutorial:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PUT /api/tutorial/skip - Skip tutorial
export async function PUT() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const tutorial = await db.tutorial.update({
      where: { userId: session.user.id },
      data: {
        skipped: true,
        skippedAt: new Date(),
        currentStep: TutorialStep.COMPLETED,
        stepsCompleted: 14
      }
    })

    return NextResponse.json({
      success: true,
      message: "Tutorial skipped",
      tutorial
    })
  } catch (error) {
    console.error("Error skipping tutorial:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
