import { db } from "@/lib/db"
import { BusinessEconomy } from "@/lib/business-economy"
import { NextResponse } from "next/server"

// GET /api/cron/economy - Update all businesses economy (called by cron job)
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Get all active businesses
    const businesses = await db.business.findMany({
      where: { isActive: true },
      select: { id: true }
    })

    // Update economy for each business
    const results = await Promise.all(
      businesses.map(async (business) => {
        try {
          await BusinessEconomy.updateBusinessEconomy(business.id)
          return { id: business.id, success: true }
        } catch (error) {
          console.error(`Error updating business ${business.id}:`, error)
          return { id: business.id, success: false, error: String(error) }
        }
      })
    )

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      processed: businesses.length,
      successCount,
      failCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron economy update error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
