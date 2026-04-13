import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const transactions = await db.transaction.findMany({
      where: {
        account: {
          userId: session.user.id,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { fromAccountId, toAccountId, amount, description } = await req.json()

    const fromAccount = await db.bankAccount.findFirst({
      where: { id: fromAccountId, userId: session.user.id },
    })

    if (!fromAccount) {
      return new NextResponse("Account not found", { status: 404 })
    }

    if (Number(fromAccount.balance) < amount) {
      return new NextResponse("Insufficient funds", { status: 400 })
    }

    await db.$transaction([
      db.bankAccount.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      }),
      db.bankAccount.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      }),
      db.transaction.create({
        data: {
          accountId: fromAccountId,
          type: "TRANSFER",
          amount,
          description,
          relatedAccountId: toAccountId,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
