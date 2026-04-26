import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { TaxOptimizationLevel } from "@prisma/client"

// Tax upgrade costs
const UPGRADE_COSTS = {
  [TaxOptimizationLevel.SARL_OPTIMIZED]: 2000,
  [TaxOptimizationLevel.HOLDING_SARL]: 15000,
  [TaxOptimizationLevel.HOLDING_OFFSHORE]: 50000
}

const UPGRADE_CONFIG = {
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

// POST /api/holdings/upgrade - Upgrade tax optimization
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { targetLevel } = await req.json()
    
    if (!targetLevel) {
      return new NextResponse("Missing target level", { status: 400 })
    }

    // Get user's holding
    const holding = await db.holding.findUnique({
      where: { userId: session.user.id }
    })

    if (!holding) {
      return new NextResponse("No holding found", { status: 404 })
    }

    const currentLevel = holding.taxOptimizationLevel
    const targetLevelEnum = targetLevel as TaxOptimizationLevel

    // Check if upgrade is valid
    const levelOrder = [
      TaxOptimizationLevel.STANDARD,
      TaxOptimizationLevel.SARL_OPTIMIZED,
      TaxOptimizationLevel.HOLDING_SARL,
      TaxOptimizationLevel.HOLDING_OFFSHORE
    ]
    
    const currentIndex = levelOrder.indexOf(currentLevel)
    const targetIndex = levelOrder.indexOf(targetLevelEnum)
    
    if (targetIndex <= currentIndex) {
      return new NextResponse("Invalid upgrade target", { status: 400 })
    }

    const upgradeCost = UPGRADE_COSTS[targetLevelEnum as keyof typeof UPGRADE_COSTS]
    const config = UPGRADE_CONFIG[targetLevelEnum as keyof typeof UPGRADE_CONFIG]

    // Get user's main account
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount) {
      return new NextResponse("No main account found", { status: 404 })
    }

    // Check balance
    if (Number(mainAccount.balance) < upgradeCost) {
      return NextResponse.json({
        success: false,
        message: "Solde insuffisant",
        required: upgradeCost,
        balance: Number(mainAccount.balance)
      }, { status: 400 })
    }

    // Update holding
    const updatedHolding = await db.holding.update({
      where: { userId: session.user.id },
      data: {
        taxOptimizationLevel: targetLevelEnum,
        annualCost: config.annualCost,
        taxRate: config.taxRate,
        revenueMultiplier: config.multiplier,
        hasDeductions: config.strategies.includes("deductions"),
        hasAmortizations: config.strategies.includes("amortizations"),
        hasProvisions: config.strategies.includes("provisions"),
        hasTaxCredits: config.strategies.includes("taxCredits"),
        hasOffshore: config.strategies.includes("offshore"),
        hasTransferPricing: config.strategies.includes("transferPricing"),
        auditRisk: targetLevelEnum === TaxOptimizationLevel.HOLDING_OFFSHORE ? 30 : 0,
        reputationRisk: targetLevelEnum === TaxOptimizationLevel.HOLDING_OFFSHORE ? 20 : 0
      }
    })

    // Deduct from bank account
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { decrement: upgradeCost } }
    })

    // Create transaction
    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "PAYMENT",
        amount: upgradeCost,
        description: `Upgrade optimisation fiscale: ${targetLevel}`
      }
    })

    return NextResponse.json({
      success: true,
      holding: updatedHolding,
      message: `Optimisation fiscale upgrade vers ${targetLevel}`
    })

  } catch (error) {
    console.error("Error upgrading holding:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
