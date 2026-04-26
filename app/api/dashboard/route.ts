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

    // Get user's bank account IDs for transaction queries
    const userAccountIds = user.bankAccounts.map((acc: any) => acc.id)

    const [totalUsers, totalBusinesses, totalSuggestions, stocks, stockTrades, transactions, recentActivity] = await Promise.all([
      db.user.count(),
      db.business.count(),
      db.suggestion.count(),
      db.stock.findMany(),
      db.stockTrade.findMany({
        where: { buyerId: session.user.id },
        include: { stock: true }
      }),
      db.transaction.count({
        where: { accountId: { in: userAccountIds } }
      }),
      db.transaction.findMany({
        where: { accountId: { in: userAccountIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { account: true }
      })
    ])

    const marketCap = stocks.reduce((acc: number, stock: any) => {
      return acc + Number(stock.currentPrice) * stock.totalShares
    }, 0)

    // Format portfolio from stockTrades
    const portfolio = stockTrades.map((trade: any) => ({
      stock: {
        symbol: trade.stock.symbol,
        currentPrice: Number(trade.stock.currentPrice)
      },
      shares: trade.shares
    }))

    // Format recent activity
    const formattedRecentActivity = recentActivity.map((tx: any) => ({
      type: tx.type,
      description: tx.description || `Transaction ${tx.type}`,
      amount: Number(tx.amount),
      createdAt: tx.createdAt.toISOString()
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        identifier: user.identifier,
        bankAccounts: user.bankAccounts,
        location: user.location,
        business: user.business,
        portfolio,
      },
      stats: {
        totalUsers,
        totalBusinesses,
        totalSuggestions,
        marketCap,
        totalTransactions: transactions,
      },
      recentActivity: formattedRecentActivity,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
