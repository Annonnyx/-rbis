import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Available shop items
const SHOP_ITEMS = [
  {
    id: "sandwich",
    name: "Sandwich",
    description: "Un sandwich nourrissant pour récupérer de l'énergie",
    price: 20,
    type: "FOOD",
    energyRestore: 40,
    icon: "🥪"
  },
  {
    id: "coffee",
    name: "Café",
    description: "Un bon café pour booster votre énergie",
    price: 15,
    type: "DRINK",
    energyRestore: 25,
    icon: "☕"
  },
  {
    id: "energy_drink",
    name: "Boisson Énergisante",
    description: "Récupération massive d'énergie",
    price: 50,
    type: "ENERGY_BOOST",
    energyRestore: 80,
    icon: "⚡"
  },
  {
    id: "meal_deal",
    name: "Menu Complet",
    description: "Repas complet pour une récupération optimale",
    price: 45,
    type: "FOOD",
    energyRestore: 70,
    icon: "🍽️"
  },
  {
    id: "protein_bar",
    name: "Barre Protéinée",
    description: "Énergie durable pour les longues sessions",
    price: 35,
    type: "SPECIAL",
    energyRestore: 50,
    energyBoost: 10, // Temporary max energy boost
    duration: 60, // 60 minutes
    icon: "💪"
  },
  {
    id: "vitamin_pack",
    name: "Pack Vitamines",
    description: "Boost d'endurance temporaire",
    price: 60,
    type: "STAMINA_POTION",
    energyRestore: 60,
    energyBoost: 20,
    duration: 120, // 120 minutes
    icon: "🧪"
  }
]

// GET /api/shop/items - Get available shop items
export async function GET() {
  return NextResponse.json({ items: SHOP_ITEMS })
}

// POST /api/shop/items/buy - Buy an item
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { itemId, quantity = 1 } = await req.json()
    
    const shopItem = SHOP_ITEMS.find(item => item.id === itemId)
    if (!shopItem) {
      return new NextResponse("Item not found", { status: 404 })
    }

    const totalPrice = shopItem.price * quantity

    // Get user's main account
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount) {
      return new NextResponse("No main account found", { status: 404 })
    }

    // Check balance
    if (Number(mainAccount.balance) < totalPrice) {
      return NextResponse.json({
        success: false,
        message: "Solde insuffisant",
        required: totalPrice,
        balance: Number(mainAccount.balance)
      }, { status: 400 })
    }

    // Deduct money
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { decrement: totalPrice } }
    })

    // Create transaction record
    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "PAYMENT",
        amount: totalPrice,
        description: `Achat: ${shopItem.name} x${quantity}`
      }
    })

    // Import Prisma enums
    const { $Enums } = await import("@prisma/client")

    // Add to inventory
    const expiresAt = shopItem.duration 
      ? new Date(Date.now() + shopItem.duration * 60 * 1000)
      : null

    await db.inventoryItem.create({
      data: {
        userId: session.user.id,
        type: $Enums.ItemType[shopItem.type as keyof typeof $Enums.ItemType],
        name: shopItem.name,
        description: shopItem.description,
        quantity,
        energyRestore: shopItem.energyRestore,
        energyBoost: shopItem.energyBoost || null,
        duration: shopItem.duration || null,
        expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      item: {
        name: shopItem.name,
        quantity,
        icon: shopItem.icon,
        effects: {
          energyRestore: shopItem.energyRestore,
          energyBoost: shopItem.energyBoost
        }
      },
      totalPrice,
      newBalance: Number(mainAccount.balance) - totalPrice,
      message: `${shopItem.name} x${quantity} acheté !`
    })

  } catch (error) {
    console.error("Error buying item:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
