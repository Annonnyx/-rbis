import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cities = await db.city.findMany({
      include: {
        _count: {
          select: {
            businesses: true,
            locations: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error("Error fetching cities:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
