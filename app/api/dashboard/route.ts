import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        bankAccounts: true,
        location: {
          include: {
            city: true,
          },
        },
        business: true,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const [totalUsers, totalBusinesses, totalSuggestions, stocks] = await Promise.all([
      db.user.count(),
      db.business.count(),
      db.suggestion.count(),
      db.stock.findMany(),
    ])

    const marketCap = stocks.reduce((acc: number, stock: any) => {
      return acc + Number(stock.currentPrice) * stock.totalShares
    }, 0)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        identifier: user.identifier,
        bankAccounts: user.bankAccounts,
        location: user.location,
        business: user.business,
      },
      stats: {
        totalUsers,
        totalBusinesses,
        totalSuggestions,
        marketCap,
      },
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
