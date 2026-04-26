import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Predefined technology tree
const TECH_TREES = {
  PRODUCT: [
    { name: "Qualité Standard", description: "Amélioration basique de la qualité", maxLevel: 3, baseCost: 5000, effect: { qualityBonus: 0.1 } },
    { name: "Premium Materials", description: "Matériaux haut de gamme", maxLevel: 5, baseCost: 25000, effect: { qualityBonus: 0.25, costIncrease: 0.15 } },
    { name: "Innovation Breakthrough", description: "Technologie révolutionnaire", maxLevel: 5, baseCost: 100000, effect: { revenueMultiplier: 1.5 } }
  ],
  PROCESS: [
    { name: "Lean Manufacturing", description: "Réduction des déchets", maxLevel: 5, baseCost: 8000, effect: { costReduction: 0.15 } },
    { name: "Automatisation", description: "Production automatisée", maxLevel: 5, baseCost: 50000, effect: { costReduction: 0.3, productivityBonus: 0.2 } },
    { name: "AI Optimization", description: "Optimisation par IA", maxLevel: 3, baseCost: 200000, effect: { costReduction: 0.5 } }
  ],
  MARKETING: [
    { name: "Social Media", description: "Marketing digital", maxLevel: 5, baseCost: 3000, effect: { marketingEfficiency: 0.2 } },
    { name: "Data Analytics", description: "Analyse comportementale", maxLevel: 5, baseCost: 15000, effect: { customerConversion: 0.25 } },
    { name: "Viral Marketing", description: "Campagnes virales", maxLevel: 3, baseCost: 80000, effect: { brandMultiplier: 2.0 } }
  ],
  LOGISTICS: [
    { name: "Route Optimization", description: "Optimisation des tournées", maxLevel: 5, baseCost: 6000, effect: { deliverySpeed: 0.2 } },
    { name: "Predictive Inventory", description: "Stock prédictif", maxLevel: 5, baseCost: 20000, effect: { inventoryEfficiency: 0.3 } },
    { name: "Drone Delivery", description: "Livraison par drone", maxLevel: 3, baseCost: 150000, effect: { deliverySpeed: 0.8 } }
  ],
  SUSTAINABILITY: [
    { name: "Green Energy", description: "Énergie renouvelable", maxLevel: 5, baseCost: 10000, effect: { reputationBonus: 0.15 } },
    { name: "Circular Economy", description: "Économie circulaire", maxLevel: 5, baseCost: 30000, effect: { costReduction: 0.1, reputationBonus: 0.25 } },
    { name: "Carbon Neutral", description: "Neutralité carbone", maxLevel: 3, baseCost: 100000, effect: { reputationBonus: 0.5, taxReduction: 0.1 } }
  ]
}

// GET /api/technologies - Get technologies for business
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
      return NextResponse.json({ technologies: [], patents: [] })
    }

    const technologies = await db.technology.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" }
    })

    const patents = await db.patent.findMany({
      where: { businessId: business.id, isActive: true },
      orderBy: { filedAt: "desc" }
    })

    return NextResponse.json({ technologies, patents, availableTechs: TECH_TREES })
  } catch (error) {
    console.error("Error fetching technologies:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/technologies - Start research
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { category, techIndex } = await req.json()
    
    if (!category || techIndex === undefined) {
      return new NextResponse("Missing parameters", { status: 400 })
    }

    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    if (!business) {
      return new NextResponse("No business found", { status: 404 })
    }

    const techTemplate = TECH_TREES[category as keyof typeof TECH_TREES]?.[techIndex]
    if (!techTemplate) {
      return new NextResponse("Technology not found", { status: 404 })
    }

    // Check if already researching
    const existing = await db.technology.findFirst({
      where: { 
        businessId: business.id,
        name: techTemplate.name,
        completedAt: null
      }
    })

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        message: "Already researching this technology" 
      })
    }

    // Check funds
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount || Number(mainAccount.balance) < techTemplate.baseCost) {
      return NextResponse.json({
        success: false,
        message: "Insufficient funds",
        required: techTemplate.baseCost
      }, { status: 400 })
    }

    // Create technology research
    const technology = await db.technology.create({
      data: {
        businessId: business.id,
        name: techTemplate.name,
        description: techTemplate.description,
        category: category as any,
        maxLevel: techTemplate.maxLevel,
        researchCost: techTemplate.baseCost,
        researchTime: 24 * techTemplate.maxLevel, // hours
        effects: JSON.stringify(techTemplate.effect),
        startedAt: new Date()
      }
    })

    // Deduct cost
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { decrement: techTemplate.baseCost } }
    })

    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "PAYMENT",
        amount: techTemplate.baseCost,
        description: `R&D: ${techTemplate.name}`
      }
    })

    return NextResponse.json({
      success: true,
      technology,
      message: `Research started: ${techTemplate.name}`
    })

  } catch (error) {
    console.error("Error starting research:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PUT /api/technologies/complete - Complete research (called by cron job or after time)
export async function PUT(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { technologyId } = await req.json()

    const technology = await db.technology.update({
      where: { id: technologyId },
      data: {
        progress: 1,
        completedAt: new Date(),
        level: { increment: 1 }
      }
    })

    // If max level reached, create patent
    if (technology.level >= technology.maxLevel) {
      const patent = await db.patent.create({
        data: {
          businessId: technology.businessId,
          name: `Patent: ${technology.name}`,
          description: technology.description,
          industry: "Technology",
          marketValue: Number(technology.researchCost) * 2,
          expiresAt: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000) // 20 years
        }
      })

      return NextResponse.json({
        success: true,
        technology,
        patent,
        message: `Research completed! Patent obtained.`
      })
    }

    return NextResponse.json({
      success: true,
      technology,
      message: `Research level ${technology.level} completed!`
    })

  } catch (error) {
    console.error("Error completing research:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
