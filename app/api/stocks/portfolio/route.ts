import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const trades = await db.stockTrade.findMany({
      where: { buyerId: session.user.id },
      include: {
        stock: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Group by stock to calculate portfolio
    const portfolioMap = new Map()
    
    for (const trade of trades) {
      const stockId = trade.stockId
      const existing = portfolioMap.get(stockId)
      
      if (existing) {
        if (trade.type === "BUY") {
          existing.shares += trade.quantity
          existing.totalInvested += Number(trade.total)
        } else {
          existing.shares -= trade.quantity
          existing.totalInvested -= Number(trade.total)
        }
      } else {
        portfolioMap.set(stockId, {
          id: trade.id,
          stock: trade.stock,
          shares: trade.type === "BUY" ? trade.quantity : -trade.quantity,
          averagePrice: trade.price,
          totalInvested: trade.type === "BUY" ? Number(trade.total) : -Number(trade.total),
        })
      }
    }

    // Filter out empty positions and format
    const portfolio = Array.from(portfolioMap.values())
      .filter(p => p.shares > 0)
      .map(p => ({
        ...p,
        averagePrice: p.totalInvested / p.shares,
      }))

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
