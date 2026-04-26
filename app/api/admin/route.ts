import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/admin - Check if current user is admin
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, identifier: true }
    })

    return NextResponse.json({
      isAdmin: user?.role === "ADMIN",
      isModerator: user?.role === "MODERATOR",
      identifier: user?.identifier
    })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/admin/make-admin - Promote user to admin (admin only)
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Check if current user is admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== "ADMIN") {
      return new NextResponse("Forbidden - Admin only", { status: 403 })
    }

    const { identifier, role, action } = await req.json()

    if (action === "promote-admin" && identifier) {
      const updatedUser = await db.user.update({
        where: { identifier },
        data: { role: "ADMIN" }
      })
      return NextResponse.json({
        success: true,
        message: `User ${updatedUser.identifier} promoted to ADMIN`,
        user: updatedUser
      })
    }

    if (action === "ban-user" && identifier) {
      const updatedUser = await db.user.update({
        where: { identifier },
        data: { role: "BANNED" }
      })
      return NextResponse.json({
        success: true,
        message: `User ${updatedUser.identifier} has been banned`,
        user: updatedUser
      })
    }

    if (action === "unban-user" && identifier) {
      const updatedUser = await db.user.update({
        where: { identifier },
        data: { role: "USER" }
      })
      return NextResponse.json({
        success: true,
        message: `User ${updatedUser.identifier} has been unbanned`,
        user: updatedUser
      })
    }

    return new NextResponse("Invalid action", { status: 400 })
  } catch (error) {
    console.error("Error in admin action:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// DELETE /api/admin/business - Delete any business (admin only)
export async function DELETE(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Check if current user is admin
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== "ADMIN") {
      return new NextResponse("Forbidden - Admin only", { status: 403 })
    }

    const { businessId, userIdentifier } = await req.json()

    let business
    if (businessId) {
      business = await db.business.findUnique({
        where: { id: businessId },
        include: { stock: true }
      })
    } else if (userIdentifier) {
      const user = await db.user.findUnique({
        where: { identifier: userIdentifier },
        select: { id: true }
      })
      if (user) {
        business = await db.business.findFirst({
          where: { userId: user.id },
          include: { stock: true }
        })
      }
    }

    if (!business) {
      return new NextResponse("Business not found", { status: 404 })
    }

    // Delete business and all related data
    await db.$transaction(async (tx) => {
      // Delete stock trades
      if (business.stock) {
        await tx.stockTrade.deleteMany({
          where: { stockId: business.stock.id }
        })
        await tx.stockHistory.deleteMany({
          where: { stockId: business.stock.id }
        })
        await tx.stock.delete({
          where: { id: business.stock.id }
        })
      }

      // Delete business account
      const businessAccount = await tx.bankAccount.findFirst({
        where: { businessId: business.id }
      })
      if (businessAccount) {
        await tx.transaction.deleteMany({
          where: { accountId: businessAccount.id }
        })
        await tx.bankAccount.delete({
          where: { id: businessAccount.id }
        })
      }

      // Delete business
      await tx.business.delete({
        where: { id: business.id }
      })
    })

    return NextResponse.json({
      success: true,
      message: "Business deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting business:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
