import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const stocks = await db.stock.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        history: {
          orderBy: { timestamp: "asc" },
          take: 30,
        },
      },
      orderBy: { currentPrice: "desc" },
    })

    return NextResponse.json(stocks)
  } catch (error) {
    console.error("Error fetching stocks:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
