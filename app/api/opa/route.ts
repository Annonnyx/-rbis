import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { OPAStatus } from "@prisma/client"

// GET /api/opa - Get user's OPA offers
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const opaOffers = await db.oPAOffer.findMany({
      where: { userId: session.user.id },
      include: {
        targetBusiness: {
          select: {
            id: true,
            name: true,
            capital: true,
            stock: {
              select: {
                symbol: true,
                currentPrice: true,
                totalShares: true,
                availableShares: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ opaOffers })
  } catch (error) {
    console.error("Error fetching OPA offers:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/opa - Create OPA offer
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { targetBusinessId, premiumPercent } = await req.json()
    
    if (!targetBusinessId || !premiumPercent) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get target business
    const targetBusiness = await db.business.findUnique({
      where: { id: targetBusinessId },
      include: { stock: true }
    })

    if (!targetBusiness || !targetBusiness.stock) {
      return new NextResponse("Target business not found or has no stock", { status: 404 })
    }

    // Cannot OPA your own business
    if (targetBusiness.userId === session.user.id) {
      return new NextResponse("Cannot OPA your own business", { status: 400 })
    }

    // Calculate offer
    const marketPrice = Number(targetBusiness.stock.currentPrice)
    const offerPricePerShare = marketPrice * (1 + premiumPercent / 100)
    const totalShares = targetBusiness.stock.totalShares
    const totalValue = offerPricePerShare * totalShares

    // Get user's main account
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount) {
      return new NextResponse("No main account found", { status: 404 })
    }

    // Check balance (need 10% as deposit)
    const depositRequired = totalValue * 0.1
    if (Number(mainAccount.balance) < depositRequired) {
      return NextResponse.json({
        success: false,
        message: "Solde insuffisant pour le dépôt (10%)",
        required: depositRequired,
        balance: Number(mainAccount.balance)
      }, { status: 400 })
    }

    // Create OPA offer
    const opaOffer = await db.oPAOffer.create({
      data: {
        userId: session.user.id,
        targetBusinessId,
        offerPricePerShare,
        totalShares,
        totalValue,
        premiumPercent,
        status: OPAStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    // Deduct deposit
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { decrement: depositRequired } }
    })

    // Create transaction
    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "PAYMENT",
        amount: depositRequired,
        description: `Dépôt OPA: ${targetBusiness.name}`
      }
    })

    return NextResponse.json({
      success: true,
      opaOffer,
      message: `OPA lancée sur ${targetBusiness.name}`
    })

  } catch (error) {
    console.error("Error creating OPA offer:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
