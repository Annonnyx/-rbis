import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/player/stats - Get player stats including energy and mini-games progress
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    let playerStats = await db.playerStats.findUnique({
      where: { userId: session.user.id },
      include: {
        miniGameSessions: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    })

    // Create default stats if not exists
    if (!playerStats) {
      playerStats = await db.playerStats.create({
        data: {
          userId: session.user.id,
          startingCapital: 500,
          energyCurrent: 100,
          energyMax: 100,
          miniGamesEarnings: 0,
          miniGamesCapReached: false
        },
        include: {
          miniGameSessions: {
            orderBy: { createdAt: "desc" },
            take: 10
          }
        }
      })
    }

    // Calculate energy regeneration (20 points per hour)
    const now = new Date()
    const lastUpdate = new Date(playerStats.lastEnergyUpdate)
    const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    const energyRegenerated = Math.floor(hoursPassed * 20)
    
    let currentEnergy = playerStats.energyCurrent + energyRegenerated
    if (currentEnergy > playerStats.energyMax) {
      currentEnergy = playerStats.energyMax
    }

    // Update energy if regenerated
    if (energyRegenerated > 0 && currentEnergy !== playerStats.energyCurrent) {
      await db.playerStats.update({
        where: { userId: session.user.id },
        data: {
          energyCurrent: currentEnergy,
          lastEnergyUpdate: now
        }
      })
    }

    // Get inventory items
    const inventory = await db.inventoryItem.findMany({
      where: { userId: session.user.id, isActive: true }
    })

    return NextResponse.json({
      energy: {
        current: currentEnergy,
        max: playerStats.energyMax,
        regenerationRate: 20, // per hour
        lastUpdate: playerStats.lastEnergyUpdate
      },
      miniGames: {
        earnings: playerStats.miniGamesEarnings,
        cap: 2000,
        capReached: playerStats.miniGamesCapReached,
        remaining: Math.max(0, 2000 - playerStats.miniGamesEarnings)
      },
      inventory,
      recentSessions: playerStats.miniGameSessions
    })
  } catch (error) {
    console.error("Error fetching player stats:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
