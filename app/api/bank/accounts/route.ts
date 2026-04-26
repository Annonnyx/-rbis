import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const accounts = await db.bankAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { isMain: "desc" },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { name, type = "PERSONAL" } = await req.json()

    const account = await db.bankAccount.create({
      data: {
        userId: session.user.id,
        name,
        type,
        balance: 0,
        currency: "Ø",
        isMain: false,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error creating account:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
