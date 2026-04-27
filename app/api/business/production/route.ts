import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { BusinessEconomy } from "@/lib/business-economy"

// POST /api/business/production - Invest in production (create stock)
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { quantity } = body

    if (!quantity || quantity <= 0) {
      return new NextResponse("Invalid quantity", { status: 400 })
    }

    // Get user's business
    const business = await db.business.findFirst({
      where: { userId: session.user.id },
      include: { location: true }
    })

    if (!business) {
      return new NextResponse("Business not found", { status: 404 })
    }

    if (!business.subType || !business.pricePositioning) {
      return new NextResponse("Business not fully configured", { status: 400 })
    }

    // Calculate production cost
    const optimalPrices = BusinessEconomy.calculateOptimalPrices(
      business.subType,
      business.pricePositioning
    )
    const productionCost = optimalPrices.productionCost * quantity

    // Check if user has enough capital
    const capital = Number(business.capital)
    if (capital < productionCost) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Insufficient funds",
          required: productionCost,
          available: capital
        }), 
        { status: 400 }
      )
    }

    // Update business: add stock, deduct capital, update totals
    const updatedBusiness = await db.business.update({
      where: { id: business.id },
      data: {
        capital: { decrement: productionCost },
        currentStock: { increment: quantity },
        totalProduced: { increment: quantity },
      }
    })

    return NextResponse.json({
      success: true,
      quantity,
      productionCost,
      newStock: updatedBusiness.currentStock,
      remainingCapital: updatedBusiness.capital,
    })
  } catch (error) {
    console.error("Error in production:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
