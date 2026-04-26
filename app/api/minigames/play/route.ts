import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { MiniGameType } from "@prisma/client"

// Mini-game configuration
const MINI_GAMES_CONFIG = {
  DELIVERY_WALKING: {
    name: "Livraison à pied",
    minEarnings: 50,
    maxEarnings: 150,
    energyCost: 15,
    duration: 120, // seconds
    cooldown: 600 // seconds
  },
  URBAN_TASKS: {
    name: "Courses urbaines",
    minEarnings: 80,
    maxEarnings: 200,
    energyCost: 20,
    duration: 180,
    cooldown: 600
  },
  DELIVERY_BIKE: {
    name: "Livraison vélo",
    minEarnings: 150,
    maxEarnings: 400,
    energyCost: 25,
    duration: 300,
    cooldown: 900
  },
  STREET_VENDOR: {
    name: "Vendeur ambulant",
    minEarnings: 200,
    maxEarnings: 500,
    energyCost: 30,
    duration: 240,
    cooldown: 900
  },
  FREELANCE_DIGITAL: {
    name: "Freelance digital",
    minEarnings: 300,
    maxEarnings: 600,
    energyCost: 35,
    duration: 360,
    cooldown: 1200
  },
  DRIVER_VTC: {
    name: "Chauffeur VTC",
    minEarnings: 400,
    maxEarnings: 800,
    energyCost: 40,
    duration: 300,
    cooldown: 1200
  }
}

const MINI_GAMES_CAP = 2000

// POST /api/minigames/play - Play a mini-game
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { type } = await req.json()
    
    if (!type || !MINI_GAMES_CONFIG[type as keyof typeof MINI_GAMES_CONFIG]) {
      return new NextResponse("Invalid mini-game type", { status: 400 })
    }

    const config = MINI_GAMES_CONFIG[type as keyof typeof MINI_GAMES_CONFIG]

    // Get or create player stats
    let playerStats = await db.playerStats.findUnique({
      where: { userId: session.user.id }
    })

    if (!playerStats) {
      playerStats = await db.playerStats.create({
        data: {
          userId: session.user.id,
          startingCapital: 500,
          energyCurrent: 100,
          energyMax: 100,
          miniGamesEarnings: 0,
          miniGamesCapReached: false
        }
      })
    }

    // Check if cap reached
    if (playerStats.miniGamesCapReached || playerStats.miniGamesEarnings >= MINI_GAMES_CAP) {
      return NextResponse.json({
        success: false,
        message: "Vous avez atteint le plafond de gains via mini-jeux (2000\u00D8). Créez une entreprise pour générer des revenus passifs !",
        capReached: true
      }, { status: 403 })
    }

    // Check cooldown
    const lastSession = await db.miniGameSession.findFirst({
      where: { userId: session.user.id, type: type as MiniGameType },
      orderBy: { createdAt: "desc" }
    })

    if (lastSession) {
      const timeSinceLastSession = (new Date().getTime() - new Date(lastSession.createdAt).getTime()) / 1000
      if (timeSinceLastSession < config.cooldown) {
        const remainingCooldown = Math.ceil(config.cooldown - timeSinceLastSession)
        return NextResponse.json({
          success: false,
          message: `Cooldown actif. Attendez ${remainingCooldown} secondes.`,
          remainingCooldown
        }, { status: 429 })
      }
    }

    // Calculate current energy with regeneration
    const now = new Date()
    const lastUpdate = new Date(playerStats.lastEnergyUpdate)
    const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    const energyRegenerated = Math.floor(hoursPassed * 20)
    let currentEnergy = Math.min(
      playerStats.energyCurrent + energyRegenerated,
      playerStats.energyMax
    )

    // Check energy
    if (currentEnergy < config.energyCost) {
      return NextResponse.json({
        success: false,
        message: "Énergie insuffisante. Consommez de la nourriture ou attendez la régénération.",
        energy: {
          current: currentEnergy,
          required: config.energyCost,
          max: playerStats.energyMax
        }
      }, { status: 400 })
    }

    // Calculate earnings (random between min and max)
    const earnings = Math.floor(
      Math.random() * (config.maxEarnings - config.minEarnings + 1) + config.minEarnings
    )

    // Apply cap limit
    const remainingCap = MINI_GAMES_CAP - playerStats.miniGamesEarnings
    const actualEarnings = Math.min(earnings, remainingCap)
    const newTotalEarnings = playerStats.miniGamesEarnings + actualEarnings
    const capReached = newTotalEarnings >= MINI_GAMES_CAP

    // Update player stats
    const newEnergy = currentEnergy - config.energyCost
    
    await db.playerStats.update({
      where: { userId: session.user.id },
      data: {
        energyCurrent: newEnergy,
        lastEnergyUpdate: now,
        miniGamesEarnings: newTotalEarnings,
        miniGamesCapReached: capReached,
        hasUsedMiniGames: true
      }
    })

    // Create session record
    await db.miniGameSession.create({
      data: {
        userId: session.user.id,
        playerStatsId: playerStats.id,
        type: type as MiniGameType,
        earnings: actualEarnings,
        energyConsumed: config.energyCost,
        duration: config.duration
      }
    })

    // Add earnings to user's bank account (main account)
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (mainAccount) {
      await db.bankAccount.update({
        where: { id: mainAccount.id },
        data: {
          balance: {
            increment: actualEarnings
          }
        }
      })

      // Create transaction record
      await db.transaction.create({
        data: {
          accountId: mainAccount.id,
          type: "DEPOSIT",
          amount: actualEarnings,
          description: `Mini-jeu: ${config.name}`
        }
      })
    }

    return NextResponse.json({
      success: true,
      earnings: actualEarnings,
      totalMiniGamesEarnings: newTotalEarnings,
      capReached,
      remainingCap: MINI_GAMES_CAP - newTotalEarnings,
      energy: {
        previous: currentEnergy,
        current: newEnergy,
        consumed: config.energyCost,
        max: playerStats.energyMax
      },
      message: capReached 
        ? "Plafond atteint ! Passez aux entreprises pour des revenus illimités."
        : `+${actualEarnings}\u00D8 gagnés !`
    })

  } catch (error) {
    console.error("Error playing mini-game:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
