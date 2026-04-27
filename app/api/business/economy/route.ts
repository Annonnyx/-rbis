import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { BusinessEconomy } from "@/lib/business-economy"

// GET /api/business/economy - Get business economy stats
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const business = await db.business.findFirst({
      where: { userId: session.user.id },
      include: { location: true }
    })

    if (!business) {
      return new NextResponse("Business not found", { status: 404 })
    }

    if (!business.subType || !business.pricePositioning) {
      return NextResponse.json({
        error: "Business not fully configured",
        needsSetup: true,
      })
    }

    // Update economy first
    await BusinessEconomy.updateBusinessEconomy(business.id)

    // Get fresh data
    const freshBusiness = await db.business.findUnique({
      where: { id: business.id },
      include: { location: true }
    })

    if (!freshBusiness) {
      return new NextResponse("Business not found", { status: 404 })
    }

    // Calculate current hourly projections
    const hourlyData = BusinessEconomy.calculateRevenue(freshBusiness, 1)

    // Get pricing info - use non-null assertion since we checked above
    const optimalPrices = BusinessEconomy.calculateOptimalPrices(
      freshBusiness.subType!,
      freshBusiness.pricePositioning!
    )

    return NextResponse.json({
      // Stock & Production
      currentStock: freshBusiness.currentStock,
      totalProduced: freshBusiness.totalProduced,
      totalSold: freshBusiness.totalSold,
      productionCost: optimalPrices.productionCost,
      
      // Pricing
      currentPrice: freshBusiness.productPrice,
      optimalPriceMin: optimalPrices.min,
      optimalPriceMax: optimalPrices.max,
      recommendedPrice: optimalPrices.recommended,
      demandScore: freshBusiness.demandScore,
      priceIndicator: freshBusiness.priceIndicator,
      
      // Revenue
      hourlyRevenue: hourlyData.revenue,
      hourlySales: hourlyData.sales,
      hourlyProfit: hourlyData.profit,
      accumulatedRevenue: freshBusiness.accumulatedRevenue,
      
      // Location bonus
      footTraffic: freshBusiness.location?.footTraffic || 50,
      
      // Business info
      subType: freshBusiness.subType,
      pricePositioning: freshBusiness.pricePositioning,
    })
  } catch (error) {
    console.error("Error fetching economy data:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
