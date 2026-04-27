import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { BusinessEconomy } from "@/lib/business-economy"

// POST /api/business/revenue/collect - Collect accumulated revenue
export async function POST() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Get user's business
    const business = await db.business.findFirst({
      where: { userId: session.user.id },
      include: { location: true }
    })

    if (!business) {
      return new NextResponse("Business not found", { status: 404 })
    }

    // First update economy to calculate latest revenue
    await BusinessEconomy.updateBusinessEconomy(business.id)

    // Refresh business data
    const updatedBusiness = await db.business.findUnique({
      where: { id: business.id }
    })

    if (!updatedBusiness) {
      return new NextResponse("Business not found", { status: 404 })
    }

    const accumulatedRevenue = Number(updatedBusiness.accumulatedRevenue)

    if (accumulatedRevenue <= 0) {
      return NextResponse.json({
        message: "Aucun revenu à collecter",
        collected: 0,
      })
    }

    // Add accumulated revenue to capital and reset it
    const finalBusiness = await db.business.update({
      where: { id: business.id },
      data: {
        capital: { increment: accumulatedRevenue },
        accumulatedRevenue: 0,
      }
    })

    return NextResponse.json({
      success: true,
      collected: accumulatedRevenue,
      newCapital: finalBusiness.capital,
      message: `${accumulatedRevenue.toFixed(2)}Ø collectés !`,
    })
  } catch (error) {
    console.error("Error collecting revenue:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
