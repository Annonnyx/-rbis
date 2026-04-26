import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET /api/admin/users - List all users with balances (admin only)
export async function GET() {
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

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        identifier: true,
        role: true,
        createdAt: true,
        bankAccounts: {
          select: {
            balance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate total balance for each user
    const usersWithBalance = users.map(user => ({
      ...user,
      balance: user.bankAccounts.reduce((acc, account) => acc + Number(account.balance), 0)
    }))

    return NextResponse.json({ users: usersWithBalance })
  } catch (error) {
    console.error("Error fetching users:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
