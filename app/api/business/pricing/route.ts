import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { BusinessEconomy } from "@/lib/business-economy"

// PUT /api/business/pricing - Update product price
export async function PUT(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { price } = body

    if (!price || price <= 0) {
      return new NextResponse("Invalid price", { status: 400 })
    }

    // Get user's business
    const business = await db.business.findFirst({
      where: { userId: session.user.id },
    })

    if (!business) {
      return new NextResponse("Business not found", { status: 404 })
    }

    if (!business.subType || !business.pricePositioning) {
      return new NextResponse("Business not fully configured", { status: 400 })
    }

    // Calculate optimal prices and indicators
    const optimalPrices = BusinessEconomy.calculateOptimalPrices(
      business.subType,
      business.pricePositioning
    )
    
    const demandScore = BusinessEconomy.calculateDemandScore(
      price,
      optimalPrices.min,
      optimalPrices.max,
      1.2 // default elasticity
    )
    
    const priceIndicator = BusinessEconomy.getPriceIndicator(
      price,
      optimalPrices.min,
      optimalPrices.max
    )

    // Update business price
    await db.business.update({
      where: { id: business.id },
      data: {
        productPrice: price,
        demandScore,
        priceIndicator,
        optimalPriceMin: optimalPrices.min,
        optimalPriceMax: optimalPrices.max,
      }
    })

    return NextResponse.json({
      success: true,
      price,
      optimalMin: optimalPrices.min,
      optimalMax: optimalPrices.max,
      demandScore,
      priceIndicator,
      message: priceIndicator === 'GOOD' 
        ? "Prix optimal !" 
        : priceIndicator === 'TOO_CHEAP'
        ? "Prix trop bas - vous pourriez augmenter vos marges"
        : "Prix trop élevé - les ventes risquent de diminuer",
    })
  } catch (error) {
    console.error("Error updating price:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// GET /api/business/pricing - Get pricing info
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const business = await db.business.findFirst({
      where: { userId: session.user.id },
    })

    if (!business || !business.subType || !business.pricePositioning) {
      return NextResponse.json({ error: "No business found" }, { status: 404 })
    }

    const optimalPrices = BusinessEconomy.calculateOptimalPrices(
      business.subType,
      business.pricePositioning
    )

    return NextResponse.json({
      currentPrice: business.productPrice,
      optimalMin: optimalPrices.min,
      optimalMax: optimalPrices.max,
      recommended: optimalPrices.recommended,
      productionCost: optimalPrices.productionCost,
      demandScore: business.demandScore,
      priceIndicator: business.priceIndicator,
    })
  } catch (error) {
    console.error("Error fetching pricing:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
