import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { CryptoType } from "@prisma/client"

// Mining configuration
const MINING_CONFIG: Partial<Record<CryptoType, {
  baseHashrate: number
  powerCost: number
  rewardPerHour: number
  upgradeCost: number
}>> = {
  [CryptoType.ORB]: {
    baseHashrate: 100, // MH/s
    powerCost: 10, // \u00D8/h
    rewardPerHour: 0.1, // coins per hour
    upgradeCost: 1000 // \u00D8 to upgrade
  },
  [CryptoType.ETHEREUM_PLUS]: {
    baseHashrate: 10,
    powerCost: 50,
    rewardPerHour: 0.001,
    upgradeCost: 5000
  },
  [CryptoType.GREENTOKEN]: {
    baseHashrate: 5,
    powerCost: 30,
    rewardPerHour: 0.01,
    upgradeCost: 3000
  },
  [CryptoType.BITGOLD]: {
    baseHashrate: 20,
    powerCost: 100,
    rewardPerHour: 0.0001,
    upgradeCost: 10000
  },
  [CryptoType.SPEEDCOIN]: {
    baseHashrate: 50,
    powerCost: 20,
    rewardPerHour: 0.05,
    upgradeCost: 2000
  }
}

// GET /api/crypto/mining - Get mining status
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const wallet = await db.cryptoWallet.findUnique({
      where: { userId: session.user.id },
      include: { cryptoMining: true }
    })

    if (!wallet) {
      return NextResponse.json({
        hasMining: false,
        message: "Créez d'abord un wallet crypto"
      })
    }

    if (!wallet.cryptoMining) {
      return NextResponse.json({
        hasMining: false,
        availableCoins: Object.keys(MINING_CONFIG),
        message: "Sélectionnez un coin à miner"
      })
    }

    // Calculate mining progress since last update
    const now = new Date()
    const lastUpdate = new Date(wallet.cryptoMining.lastMiningUpdate)
    const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    
    if (hoursPassed > 0 && wallet.cryptoMining.isActive) {
      const reward = wallet.cryptoMining.hashrate * hoursPassed * 0.001 // Simplified formula
      const cost = wallet.cryptoMining.miningCostPerHour * hoursPassed
      
      // Update wallet balance (simplified - would need to track which coin)
      await db.cryptoWallet.update({
        where: { userId: session.user.id },
        data: {
          ethereumPlusBalance: { increment: reward },
          totalValue: { increment: reward * 3000 } // Approximate value
        }
      })

      // Update mining
      await db.cryptoMining.update({
        where: { userId: session.user.id },
        data: {
          lastMiningUpdate: now,
          totalMined: { increment: reward }
        }
      })

      // Create transaction
      await db.cryptoTransaction.create({
        data: {
          userId: session.user.id,
          cryptoWalletId: wallet.id,
          type: 'MINING_REWARD',
          cryptoType: CryptoType.ETHEREUM_PLUS,
          amount: reward,
          pricePerUnit: 3000,
          totalValue: reward * 3000
        }
      })
    }

    return NextResponse.json({
      hasMining: true,
      mining: wallet.cryptoMining,
      config: MINING_CONFIG
    })
  } catch (error) {
    console.error("Error fetching mining status:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/crypto/mining/start - Start mining
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { cryptoType } = await req.json()
    
    if (!cryptoType || !MINING_CONFIG[cryptoType as CryptoType]) {
      return new NextResponse("Invalid crypto type", { status: 400 })
    }

    const config = MINING_CONFIG[cryptoType as CryptoType]
    if (!config) {
      return new NextResponse("Invalid crypto type", { status: 400 })
    }

    // Get wallet
    const wallet = await db.cryptoWallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!wallet) {
      return new NextResponse("Wallet not found", { status: 404 })
    }

    // Check if mining already exists
    const existingMining = await db.cryptoMining.findUnique({
      where: { userId: session.user.id }
    })

    if (existingMining) {
      // Update existing
      await db.cryptoMining.update({
        where: { userId: session.user.id },
        data: {
          hashrate: config.baseHashrate,
          powerConsumption: config.baseHashrate * 10,
          miningCostPerHour: config.powerCost,
          isActive: true,
          lastMiningUpdate: new Date()
        }
      })
    } else {
      // Create new
      await db.cryptoMining.create({
        data: {
          userId: session.user.id,
          cryptoWalletId: wallet.id,
          hashrate: config.baseHashrate,
          powerConsumption: config.baseHashrate * 10,
          miningCostPerHour: config.powerCost,
          isActive: true,
          lastMiningUpdate: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Mining démarré pour ${cryptoType}`,
      config
    })

  } catch (error) {
    console.error("Error starting mining:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/crypto/mining/stop - Stop mining
export async function PUT(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    await db.cryptoMining.update({
      where: { userId: session.user.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: "Mining arrêté"
    })
  } catch (error) {
    console.error("Error stopping mining:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
