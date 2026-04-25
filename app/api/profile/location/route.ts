import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { cityId } = await req.json()

    if (!cityId) {
      return new NextResponse("City ID required", { status: 400 })
    }

    const city = await db.city.findUnique({
      where: { id: cityId },
    })

    if (!city) {
      return new NextResponse("City not found", { status: 404 })
    }

    const userLocation = await db.userLocation.upsert({
      where: { userId: session.user.id },
      update: {
        cityId: cityId,
        lat: city.lat,
        lng: city.lng,
      },
      create: {
        userId: session.user.id,
        cityId: cityId,
        lat: city.lat,
        lng: city.lng,
      },
      include: {
        city: true,
      },
    })

    return NextResponse.json(userLocation)
  } catch (error) {
    console.error("Error updating location:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
