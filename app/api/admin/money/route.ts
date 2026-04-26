import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// POST /api/admin/money - Add money to user (admin only)
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

    const { identifier, amount, reason } = await req.json()

    if (!identifier || !amount || amount <= 0) {
      return new NextResponse("Invalid parameters", { status: 400 })
    }

    // Find user
    const user = await db.user.findUnique({
      where: { identifier },
      include: { bankAccounts: true }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Find main account
    const mainAccount = user.bankAccounts.find(acc => acc.isMain) || user.bankAccounts[0]

    if (!mainAccount) {
      return new NextResponse("User has no bank account", { status: 400 })
    }

    // Add money
    await db.$transaction([
      db.bankAccount.update({
        where: { id: mainAccount.id },
        data: { balance: { increment: amount } }
      }),
      db.transaction.create({
        data: {
          accountId: mainAccount.id,
          type: "DEPOSIT",
          amount: amount,
          description: reason || `Admin deposit by ${session.user.id}`
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: `Added ${amount}Ø to user ${identifier}`,
      newBalance: Number(mainAccount.balance) + amount
    })
  } catch (error) {
    console.error("Error adding money:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
