import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Sample franchisee cities
const FRANCHISE_CITIES = [
  { city: "Paris", country: "France", multiplier: 1.5 },
  { city: "Lyon", country: "France", multiplier: 1.2 },
  { city: "Marseille", country: "France", multiplier: 1.1 },
  { city: "Bordeaux", country: "France", multiplier: 1.15 },
  { city: "Lille", country: "France", multiplier: 1.1 },
  { city: "Toulouse", country: "France", multiplier: 1.1 },
  { city: "Nice", country: "France", multiplier: 1.2 },
  { city: "Strasbourg", country: "France", multiplier: 1.05 }
]

// GET /api/franchises - Get franchises
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const franchises = await db.franchise.findMany({
      where: { franchisorId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    // Generate available locations
    const availableLocations = FRANCHISE_CITIES.map(loc => ({
      ...loc,
      entryFee: Math.round(20000 * loc.multiplier),
      expectedMonthlyRevenue: Math.round(50000 * loc.multiplier),
      available: !franchises.some(f => f.city === loc.city)
    }))

    return NextResponse.json({ 
      franchises, 
      availableLocations,
      businessType: business?.type,
      totalRoyaltyRevenue: franchises.reduce((sum, f) => sum + Number(f.royaltyPaid), 0)
    })
  } catch (error) {
    console.error("Error fetching franchises:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/franchises - Create franchise
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { city, country, entryFee, royaltyRate } = await req.json()
    
    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return new NextResponse("No business found", { status: 404 })
    }

    // Check if already exists
    const existing = await db.franchise.findFirst({
      where: { franchisorId: session.user.id, city }
    })

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Franchise already exists in this city"
      })
    }

    // Check funds
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount || Number(mainAccount.balance) < entryFee) {
      return NextResponse.json({
        success: false,
        message: "Insufficient funds for entry fee",
        required: entryFee
      }, { status: 400 })
    }

    const franchise = await db.franchise.create({
      data: {
        franchisorId: session.user.id,
        brandName: business.name,
        businessType: (business.type || "RETAIL") as any,
        entryFee,
        royaltyRate,
        city,
        country,
        address: `${business.name} - ${city}`,
        status: "ACTIVE",
        openedAt: new Date()
      }
    })

    // Deduct entry fee
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { decrement: entryFee } }
    })

    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "PAYMENT",
        amount: entryFee,
        description: `Franchise entry fee: ${city}`
      }
    })

    return NextResponse.json({
      success: true,
      franchise,
      message: `Franchise opened in ${city}`
    })

  } catch (error) {
    console.error("Error creating franchise:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PUT /api/franchises/collect - Collect royalties
export async function PUT(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { franchiseId } = await req.json()

    const franchise = await db.franchise.findUnique({
      where: { id: franchiseId }
    })

    if (!franchise || franchise.franchisorId !== session.user.id) {
      return new NextResponse("Franchise not found", { status: 404 })
    }

    // Calculate monthly royalty
    const monthlyRoyalty = Number(franchise.monthlyRevenue) * Number(franchise.royaltyRate)

    // Add to user's account
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (mainAccount && monthlyRoyalty > 0) {
      await db.bankAccount.update({
        where: { id: mainAccount.id },
        data: { balance: { increment: monthlyRoyalty } }
      })

      await db.transaction.create({
        data: {
          accountId: mainAccount.id,
          type: "DEPOSIT",
          amount: monthlyRoyalty,
          description: `Royalty: ${franchise.city}`
        }
      })

      // Update franchise
      await db.franchise.update({
        where: { id: franchiseId },
        data: {
          royaltyPaid: { increment: monthlyRoyalty },
          monthlyRevenue: 0 // Reset for next month
        }
      })
    }

    return NextResponse.json({
      success: true,
      royalty: monthlyRoyalty,
      message: `Collected ${monthlyRoyalty.toFixed(0)}\u00D8 in royalties`
    })

  } catch (error) {
    console.error("Error collecting royalties:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
