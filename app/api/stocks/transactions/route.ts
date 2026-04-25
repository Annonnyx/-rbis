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
          select: {
            symbol: true,
            business: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Format to match frontend expectations
    const transactions = trades.map(trade => ({
      id: trade.id,
      type: trade.type,
      shares: trade.quantity,
      price: trade.price,
      totalAmount: trade.total,
      createdAt: trade.createdAt,
      stock: trade.stock,
    }))

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching stock transactions:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
