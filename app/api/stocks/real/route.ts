import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { allRealStocks, simulatePriceMovement, getSectorPerformance } from "@/lib/real-stocks"

// GET /api/stocks/real - Get real-world stocks
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Get user stock trades for real stocks
    const stockTrades = await db.stockTrade.findMany({
      where: { 
        buyerId: session.user.id,
        stock: {
          isRealStock: true
        }
      },
      include: { 
        stock: true 
      }
    })

    // Calculate portfolio
    const portfolio = stockTrades.map(trade => ({
      symbol: trade.stock.symbol,
      name: trade.stock.name,
      shares: trade.quantity,
      avgPrice: Number(trade.price),
      currentPrice: Number(trade.stock.currentPrice),
      value: trade.quantity * Number(trade.stock.currentPrice),
      gain: trade.quantity * (Number(trade.stock.currentPrice) - Number(trade.price))
    }))

    // Get all real stocks with current simulated prices
    const stocks = allRealStocks.map(stock => {
      const realStockInDB = stockTrades.find(t => t.stock.symbol === stock.symbol)
      const currentPrice = realStockInDB 
        ? Number(realStockInDB.stock.currentPrice) 
        : simulatePriceMovement(stock)
      
      return {
        ...stock,
        currentPrice,
        availableShares: stock.totalShares,
        myShares: portfolio.find(p => p.symbol === stock.symbol)?.shares || 0
      }
    })

    // Get sector performance
    const sectorPerformance = getSectorPerformance()

    return NextResponse.json({
      stocks,
      portfolio,
      sectorPerformance,
      totalValue: portfolio.reduce((acc, item) => acc + item.value, 0),
      totalGain: portfolio.reduce((acc, item) => acc + item.gain, 0)
    })
  } catch (error) {
    console.error("Error fetching real stocks:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/stocks/real/trade - Trade real-world stocks
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { symbol, type, shares } = await req.json()

    if (!symbol || !type || !shares || shares <= 0) {
      return new NextResponse("Invalid parameters", { status: 400 })
    }

    const userId = session.user.id

    // Get or create the real stock in database
    let stock = await db.stock.findUnique({
      where: { symbol }
    })

    if (!stock) {
      // Create stock from real stock data
      const realStock = allRealStocks.find(s => s.symbol === symbol)
      if (!realStock) {
        return new NextResponse("Stock not found", { status: 404 })
      }

      stock = await db.stock.create({
        data: {
          symbol: realStock.symbol,
          name: realStock.name,
          totalShares: realStock.totalShares,
          availableShares: realStock.totalShares,
          currentPrice: realStock.gamePrice,
          isRealStock: true,
          sector: realStock.sector
        }
      })
    }

    const mainAccount = await db.bankAccount.findFirst({
      where: { userId, isMain: true }
    })

    if (!mainAccount) {
      return new NextResponse("No bank account found", { status: 400 })
    }

    if (type === "BUY") {
      const totalCost = Number(stock.currentPrice) * shares

      if (Number(mainAccount.balance) < totalCost) {
        return new NextResponse("Insufficient funds", { status: 400 })
      }

      // Execute buy
      await db.$transaction([
        db.bankAccount.update({
          where: { id: mainAccount.id },
          data: { balance: { decrement: totalCost } }
        }),
        db.stockTrade.create({
          data: {
            stockId: stock.id,
            buyerId: userId,
            quantity: shares,
            price: stock.currentPrice,
            total: Number(stock.currentPrice) * shares,
            type: "BUY"
          }
        }),
        db.stock.update({
          where: { id: stock.id },
          data: { availableShares: { decrement: shares } }
        }),
        db.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: "PAYMENT",
            amount: totalCost,
            description: `Achat ${shares} actions ${stock.symbol}`
          }
        })
      ])

      return NextResponse.json({ success: true, message: `Bought ${shares} shares of ${symbol}` })
    }

    if (type === "SELL") {
      // Check user's holdings
      const userTrades = await db.stockTrade.findMany({
        where: { buyerId: userId, stockId: stock.id }
      })
      const totalShares = userTrades.reduce((acc, trade) => acc + trade.quantity, 0)

      if (totalShares < shares) {
        return new NextResponse("Insufficient shares", { status: 400 })
      }

      const totalValue = Number(stock.currentPrice) * shares

      // Execute sell
      await db.$transaction([
        db.bankAccount.update({
          where: { id: mainAccount.id },
          data: { balance: { increment: totalValue } }
        }),
        db.stockTrade.create({
          data: {
            stockId: stock.id,
            buyerId: userId,
            quantity: -shares,
            price: stock.currentPrice,
            total: Number(stock.currentPrice) * shares,
            type: "SELL"
          }
        }),
        db.stock.update({
          where: { id: stock.id },
          data: { availableShares: { increment: shares } }
        }),
        db.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: "DEPOSIT",
            amount: totalValue,
            description: `Vente ${shares} actions ${stock.symbol}`
          }
        })
      ])

      return NextResponse.json({ success: true, message: `Sold ${shares} shares of ${symbol}` })
    }

    return new NextResponse("Invalid trade type", { status: 400 })
  } catch (error) {
    console.error("Error trading real stock:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
