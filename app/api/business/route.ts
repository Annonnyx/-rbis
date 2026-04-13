import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const business = await db.business.findFirst({
      where: { userId: session.user.id },
      include: {
        stock: true,
      },
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error("Error fetching business:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const userId = session.user.id

  try {
    const { name, description, objective, product, service } = await req.json()

    const existingBusiness = await db.business.findFirst({
      where: { userId },
    })

    if (existingBusiness) {
      return new NextResponse("Business already exists", { status: 400 })
    }

    const mainAccount = await db.bankAccount.findFirst({
      where: { userId, isMain: true },
    })

    if (!mainAccount || Number(mainAccount.balance) < 300) {
      return new NextResponse("Insufficient funds (300 Ø required)", { status: 400 })
    }

    const userLocation = await db.userLocation.findUnique({
      where: { userId },
    })

    const business = await db.business.create({
      data: {
        userId,
        name,
        description,
        objective,
        product,
        service,
        capital: 300,
        cityId: userLocation?.cityId,
      },
    })

    const symbol = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + ""
    const uniqueSymbol = symbol + Math.floor(Math.random() * 100)

    const [_, __, ___, stock] = await db.$transaction([
      db.bankAccount.update({
        where: { id: mainAccount.id },
        data: { balance: { decrement: 300 } },
      }),
      db.transaction.create({
        data: {
          accountId: mainAccount.id,
          type: "WITHDRAWAL",
          amount: 300,
          description: "Création d'entreprise",
        },
      }),
      db.bankAccount.create({
        data: {
          userId,
          businessId: business.id,
          type: "BUSINESS",
          name: `Compte ${name}`,
          balance: 300,
          currency: "Ø",
          isMain: false,
        },
      }),
      db.stock.create({
        data: {
          businessId: business.id,
          symbol: uniqueSymbol,
          totalShares: 1000,
          availableShares: 1000,
          currentPrice: 1.0,
        },
      }),
    ])

    return NextResponse.json(business)
  } catch (error) {
    console.error("Error creating business:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
