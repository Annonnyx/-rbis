import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/player/inventory - Get player's inventory
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const items = await db.inventoryItem.findMany({
      where: { 
        userId: session.user.id, 
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/player/inventory/use - Use an inventory item
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { itemId } = await req.json()
    
    if (!itemId) {
      return new NextResponse("Item ID required", { status: 400 })
    }

    const item = await db.inventoryItem.findFirst({
      where: { 
        id: itemId, 
        userId: session.user.id, 
        isActive: true 
      }
    })

    if (!item) {
      return new NextResponse("Item not found", { status: 404 })
    }

    // Get player stats
    const playerStats = await db.playerStats.findUnique({
      where: { userId: session.user.id }
    })

    if (!playerStats) {
      return new NextResponse("Player stats not found", { status: 404 })
    }

    // Apply effects
    let energyRestored = 0
    let newEnergyMax = playerStats.energyMax

    if (item.energyRestore) {
      energyRestored = item.energyRestore
    }

    if (item.energyBoost) {
      newEnergyMax += item.energyBoost
    }

    // Update player stats
    let newEnergy = playerStats.energyCurrent + energyRestored
    if (newEnergy > newEnergyMax) {
      newEnergy = newEnergyMax
    }

    await db.playerStats.update({
      where: { userId: session.user.id },
      data: {
        energyCurrent: newEnergy,
        energyMax: newEnergyMax,
        lastEnergyUpdate: new Date()
      }
    })

    // Decrease item quantity or deactivate
    if (item.quantity > 1) {
      await db.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: item.quantity - 1 }
      })
    } else {
      await db.inventoryItem.update({
        where: { id: itemId },
        data: { isActive: false }
      })
    }

    return NextResponse.json({
      success: true,
      item: {
        name: item.name,
        type: item.type,
        effects: {
          energyRestored,
          energyBoost: item.energyBoost || 0
        }
      },
      energy: {
        previous: playerStats.energyCurrent,
        current: newEnergy,
        max: newEnergyMax
      },
      message: `${item.name} consommé ! +${energyRestored} énergie${item.energyBoost ? `, max énergie +${item.energyBoost}` : ''}`
    })

  } catch (error) {
    console.error("Error using item:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
