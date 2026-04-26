import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Sample B2B client templates
const B2B_TEMPLATES = [
  { name: "Bistro Central", industry: "restaurant", volume: 500, price: 12 },
  { name: "Fitness Pro", industry: "gym", volume: 800, price: 8 },
  { name: "Supermarché Plus", industry: "supermarket", volume: 2000, price: 6 },
  { name: "Hôtel Luxe", industry: "hotel", volume: 300, price: 15 },
  { name: "Café République", industry: "cafe", volume: 400, price: 10 },
  { name: "Corporate Catering", industry: "catering", volume: 1000, price: 9 }
]

// GET /api/b2b - Get B2B clients and suppliers
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return NextResponse.json({ clients: [], suppliers: [], prospects: [] })
    }

    const clients = await db.b2BClient.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" }
    })

    const suppliers = await db.supplier.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" }
    })

    // Generate prospects (not yet contacted)
    const prospects = B2B_TEMPLATES.map((template, i) => ({
      id: `prospect-${i}`,
      ...template,
      potentialRevenue: template.volume * template.price * 12 // annual
    })).filter(p => !clients.some(c => c.name === p.name))

    return NextResponse.json({ clients, suppliers, prospects })
  } catch (error) {
    console.error("Error fetching B2B:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/b2b/client - Sign new B2B client
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { prospectId, name, industry, monthlyVolume, unitPrice } = await req.json()
    
    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return new NextResponse("No business found", { status: 404 })
    }

    // Check if already client
    const existing = await db.b2BClient.findFirst({
      where: { businessId: business.id, name }
    })

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Already a client"
      })
    }

    const client = await db.b2BClient.create({
      data: {
        businessId: business.id,
        name,
        industry,
        contractStatus: "ACTIVE",
        monthlyVolume,
        unitPrice,
        satisfaction: 0.8,
        loyaltyYears: 0,
        totalRevenue: 0
      }
    })

    return NextResponse.json({
      success: true,
      client,
      message: `Contract signed with ${name}`
    })

  } catch (error) {
    console.error("Error signing B2B client:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PUT /api/b2b/supplier - Add supplier
export async function PUT(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { name, materialType, basePrice, qualityRating } = await req.json()
    
    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return new NextResponse("No business found", { status: 404 })
    }

    const supplier = await db.supplier.create({
      data: {
        businessId: business.id,
        name,
        materialType,
        basePrice,
        qualityRating: qualityRating || 5,
        reliability: 0.8 + Math.random() * 0.2
      }
    })

    return NextResponse.json({
      success: true,
      supplier,
      message: `Supplier ${name} added`
    })

  } catch (error) {
    console.error("Error adding supplier:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
