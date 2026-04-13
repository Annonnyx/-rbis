import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const userId = session.user.id

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        bankAccounts: {
          select: { id: true, name: true },
        },
        location: {
          include: {
            city: true,
          },
        },
        business: {
          select: { name: true },
        },
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const userId = session.user.id

  try {
    const { firstName, lastName } = await req.json()

    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (user?.nameChangedAt) {
      const lastChange = new Date(user.nameChangedAt)
      const now = new Date()
      const daysSince = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSince < 30) {
        return new NextResponse("Name can only be changed once per month", { status: 400 })
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        nameChangedAt: new Date(),
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
