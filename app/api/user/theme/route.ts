import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { ThemeColor } from "@prisma/client"

// PUT /api/user/theme - Update user's theme color
export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { themeColor } = body

    // Validate theme color
    if (!themeColor || !Object.values(ThemeColor).includes(themeColor as ThemeColor)) {
      return new NextResponse("Invalid theme color", { status: 400 })
    }

    // Update user's theme color
    await db.user.update({
      where: { id: session.user.id },
      data: { themeColor: themeColor as ThemeColor },
    })

    return NextResponse.json({ success: true, themeColor })
  } catch (error) {
    console.error("Error updating theme:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
