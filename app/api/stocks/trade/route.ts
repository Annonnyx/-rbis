import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const userId = session.user.id

  try {
    const { stockId, quantity, type } = await req.json()

    const stock = await db.stock.findUnique({
      where: { id: stockId },
      include: { business: true },
    })

    if (!stock) {
      return new NextResponse("Stock not found", { status: 404 })
    }

    const mainAccount = await db.bankAccount.findFirst({
      where: { userId, isMain: true },
    })

    if (!mainAccount) {
      return new NextResponse("No main account found", { status: 404 })
    }

    const totalPrice = Number(stock.currentPrice) * quantity

    if (type === "BUY") {
      if (stock.availableShares < quantity) {
        return new NextResponse("Not enough shares available", { status: 400 })
      }

      if (Number(mainAccount.balance) < totalPrice) {
        return new NextResponse("Insufficient funds", { status: 400 })
      }

      await db.$transaction([
        db.bankAccount.update({
          where: { id: mainAccount.id },
          data: { balance: { decrement: totalPrice } },
        }),
        db.stock.update({
          where: { id: stockId },
          data: { availableShares: { decrement: quantity } },
        }),
        db.stockTrade.create({
          data: {
            stockId,
            buyerId: userId,
            quantity,
            price: stock.currentPrice,
            total: totalPrice,
            type: "BUY"
          },
        }),
        db.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: "WITHDRAWAL",
            amount: totalPrice,
            description: `Achat de ${quantity} actions ${stock.symbol}`,
          },
        }),
      ])
    } else if (type === "SELL") {
      await db.$transaction([
        db.bankAccount.update({
          where: { id: mainAccount.id },
          data: { balance: { increment: totalPrice } },
        }),
        db.stock.update({
          where: { id: stockId },
          data: { availableShares: { increment: quantity } },
        }),
        db.stockTrade.create({
          data: {
            stockId,
            buyerId: stock.business.userId,
            sellerId: userId,
            quantity,
            price: stock.currentPrice,
            total: totalPrice,
            type: "SELL"
          },
        }),
        db.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: "DEPOSIT",
            amount: totalPrice,
            description: `Vente de ${quantity} actions ${stock.symbol}`,
          },
        }),
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error trading:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
