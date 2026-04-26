import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { CryptoType } from "@prisma/client"

// Crypto prices and volatility (simulated)
const CRYPTO_CONFIG = {
  [CryptoType.ORB]: { basePrice: 1, volatility: 0.02, stakingRate: 0.03 },
  [CryptoType.BITGOLD]: { basePrice: 50000, volatility: 0.05, stakingRate: 0.05 },
  [CryptoType.ETHEREUM_PLUS]: { basePrice: 3000, volatility: 0.08, stakingRate: 0.08 },
  [CryptoType.SPEEDCOIN]: { basePrice: 0.1, volatility: 0.15, stakingRate: 0.12 },
  [CryptoType.GREENTOKEN]: { basePrice: 5, volatility: 0.04, stakingRate: 0.06 }
}

// Simulate current price with random volatility
function getCurrentPrice(cryptoType: CryptoType): number {
  const config = CRYPTO_CONFIG[cryptoType]
  const randomFactor = 1 + (Math.random() - 0.5) * 2 * config.volatility
  return config.basePrice * randomFactor
}

// GET /api/crypto/wallet - Get user's crypto wallet
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    let wallet = await db.cryptoWallet.findUnique({
      where: { userId: session.user.id },
      include: {
        cryptoTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        cryptoMining: true
      }
    })

    // Create wallet if not exists
    if (!wallet) {
      wallet = await db.cryptoWallet.create({
        data: {
          userId: session.user.id,
          orbBalance: 0,
          bitgoldBalance: 0,
          ethereumPlusBalance: 0,
          speedcoinBalance: 0,
          greentokenBalance: 0,
          totalValue: 0
        },
        include: {
          cryptoTransactions: {
            orderBy: { createdAt: "desc" },
            take: 10
          },
          cryptoMining: true
        }
      })
    }

    // Calculate current prices and total value
    const prices = {
      ORB: getCurrentPrice(CryptoType.ORB),
      BITGOLD: getCurrentPrice(CryptoType.BITGOLD),
      ETHEREUM_PLUS: getCurrentPrice(CryptoType.ETHEREUM_PLUS),
      SPEEDCOIN: getCurrentPrice(CryptoType.SPEEDCOIN),
      GREENTOKEN: getCurrentPrice(CryptoType.GREENTOKEN)
    }

    const totalValue = 
      Number(wallet.orbBalance) * prices.ORB +
      Number(wallet.bitgoldBalance) * prices.BITGOLD +
      Number(wallet.ethereumPlusBalance) * prices.ETHEREUM_PLUS +
      Number(wallet.speedcoinBalance) * prices.SPEEDCOIN +
      Number(wallet.greentokenBalance) * prices.GREENTOKEN

    // Update total value
    await db.cryptoWallet.update({
      where: { userId: session.user.id },
      data: { totalValue }
    })

    return NextResponse.json({
      wallet: {
        ...wallet,
        totalValue
      },
      prices,
      config: CRYPTO_CONFIG
    })
  } catch (error) {
    console.error("Error fetching crypto wallet:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/crypto/wallet/buy - Buy crypto
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { cryptoType, amount } = await req.json()
    
    if (!cryptoType || !amount || amount <= 0) {
      return new NextResponse("Invalid parameters", { status: 400 })
    }

    const price = getCurrentPrice(cryptoType as CryptoType)
    const totalCost = price * amount

    // Get user's main account
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount) {
      return new NextResponse("No main account found", { status: 404 })
    }

    // Check balance
    if (Number(mainAccount.balance) < totalCost) {
      return NextResponse.json({
        success: false,
        message: "Solde insuffisant",
        required: totalCost,
        balance: Number(mainAccount.balance)
      }, { status: 400 })
    }

    // Get or create wallet
    let wallet = await db.cryptoWallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!wallet) {
      wallet = await db.cryptoWallet.create({
        data: {
          userId: session.user.id,
          orbBalance: 0,
          bitgoldBalance: 0,
          ethereumPlusBalance: 0,
          speedcoinBalance: 0,
          greentokenBalance: 0,
          totalValue: 0
        }
      })
    }

    // Update wallet balance based on crypto type
    const balanceField = {
      [CryptoType.ORB]: 'orbBalance',
      [CryptoType.BITGOLD]: 'bitgoldBalance',
      [CryptoType.ETHEREUM_PLUS]: 'ethereumPlusBalance',
      [CryptoType.SPEEDCOIN]: 'speedcoinBalance',
      [CryptoType.GREENTOKEN]: 'greentokenBalance'
    }[cryptoType as CryptoType]

    await db.cryptoWallet.update({
      where: { userId: session.user.id },
      data: {
        [balanceField]: {
          increment: amount
        }
      }
    })

    // Deduct from bank account
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { decrement: totalCost } }
    })

    // Create transaction record
    await db.cryptoTransaction.create({
      data: {
        userId: session.user.id,
        cryptoWalletId: wallet.id,
        type: 'BUY',
        cryptoType: cryptoType as CryptoType,
        amount,
        pricePerUnit: price,
        totalValue: totalCost
      }
    })

    // Create bank transaction
    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "PAYMENT",
        amount: totalCost,
        description: `Achat crypto: ${cryptoType}`
      }
    })

    return NextResponse.json({
      success: true,
      cryptoType,
      amount,
      pricePerUnit: price,
      totalCost,
      newBalance: Number(mainAccount.balance) - totalCost
    })

  } catch (error) {
    console.error("Error buying crypto:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
