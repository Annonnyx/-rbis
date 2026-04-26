import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { LegalStructure, TaxOptimizationLevel } from "@prisma/client"

// Tax optimization configuration
const TAX_CONFIG = {
  [TaxOptimizationLevel.STANDARD]: {
    multiplier: 1.0,
    taxRate: 0.25,
    annualCost: 0,
    strategies: []
  },
  [TaxOptimizationLevel.SARL_OPTIMIZED]: {
    multiplier: 1.2,
    taxRate: 0.20,
    annualCost: 2000,
    strategies: ["deductions", "amortizations"]
  },
  [TaxOptimizationLevel.HOLDING_SARL]: {
    multiplier: 1.4,
    taxRate: 0.15,
    annualCost: 15000,
    strategies: ["deductions", "amortizations", "provisions", "taxCredits"]
  },
  [TaxOptimizationLevel.HOLDING_OFFSHORE]: {
    multiplier: 1.7,
    taxRate: 0.05,
    annualCost: 70000,
    strategies: ["deductions", "amortizations", "provisions", "taxCredits", "offshore", "transferPricing"]
  }
}

const LEGAL_STRUCTURE_COSTS = {
  [LegalStructure.AUTO_ENTREPRENEUR]: 0,
  [LegalStructure.SARL]: 2000,
  [LegalStructure.SAS]: 3000,
  [LegalStructure.HOLDING]: 15000,
  [LegalStructure.OFFSHORE]: 50000
}

// GET /api/holdings - Get user's holding
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const holding = await db.holding.findUnique({
      where: { userId: session.user.id },
      include: {
        subsidiaries: {
          include: {
            business: true
          }
        }
      }
    })

    if (!holding) {
      return NextResponse.json({
        hasHolding: false,
        message: "Créez une holding pour optimiser vos impôts"
      })
    }

    return NextResponse.json({
      hasHolding: true,
      holding,
      config: TAX_CONFIG
    })
  } catch (error) {
    console.error("Error fetching holding:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/holdings - Create holding
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { name, legalStructure } = await req.json()
    
    if (!name || !legalStructure) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if holding already exists
    const existing = await db.holding.findUnique({
      where: { userId: session.user.id }
    })

    if (existing) {
      return new NextResponse("Holding already exists", { status: 400 })
    }

    const creationCost = LEGAL_STRUCTURE_COSTS[legalStructure as LegalStructure]

    // Get user's main account
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount) {
      return new NextResponse("No main account found", { status: 404 })
    }

    // Check balance
    if (Number(mainAccount.balance) < creationCost) {
      return NextResponse.json({
        success: false,
        message: "Solde insuffisant",
        required: creationCost,
        balance: Number(mainAccount.balance)
      }, { status: 400 })
    }

    // Determine initial tax optimization level
    let taxLevel: TaxOptimizationLevel = TaxOptimizationLevel.STANDARD
    if (legalStructure === LegalStructure.SARL) {
      taxLevel = TaxOptimizationLevel.SARL_OPTIMIZED
    } else if (legalStructure === LegalStructure.HOLDING) {
      taxLevel = TaxOptimizationLevel.HOLDING_SARL
    } else if (legalStructure === LegalStructure.OFFSHORE) {
      taxLevel = TaxOptimizationLevel.HOLDING_OFFSHORE
    }

    const config = TAX_CONFIG[taxLevel]

    // Create holding
    const holding = await db.holding.create({
      data: {
        userId: session.user.id,
        name,
        legalStructure: legalStructure as LegalStructure,
        taxOptimizationLevel: taxLevel,
        capital: creationCost,
        annualCost: config.annualCost,
        taxRate: config.taxRate,
        revenueMultiplier: config.multiplier,
        hasDeductions: (config.strategies as string[]).includes("deductions"),
        hasAmortizations: (config.strategies as string[]).includes("amortizations"),
        hasProvisions: (config.strategies as string[]).includes("provisions"),
        hasTaxCredits: (config.strategies as string[]).includes("taxCredits"),
        hasOffshore: (config.strategies as string[]).includes("offshore"),
        hasTransferPricing: (config.strategies as string[]).includes("transferPricing"),
        auditRisk: legalStructure === LegalStructure.OFFSHORE ? 30 : 0,
        reputationRisk: legalStructure === LegalStructure.OFFSHORE ? 20 : 0
      }
    })

    // Deduct from bank account
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { decrement: creationCost } }
    })

    // Create transaction
    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "PAYMENT",
        amount: creationCost,
        description: `Création holding: ${name}`
      }
    })

    return NextResponse.json({
      success: true,
      holding,
      message: `Holding "${name}" créée avec succès`
    })

  } catch (error) {
    console.error("Error creating holding:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
