import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const businesses = await db.business.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        cityId: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
