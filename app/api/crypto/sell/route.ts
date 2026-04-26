import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { CryptoType } from "@prisma/client"

// Crypto prices (same as wallet route)
const CRYPTO_CONFIG = {
  [CryptoType.ORB]: { basePrice: 1, volatility: 0.02 },
  [CryptoType.BITGOLD]: { basePrice: 50000, volatility: 0.05 },
  [CryptoType.ETHEREUM_PLUS]: { basePrice: 3000, volatility: 0.08 },
  [CryptoType.SPEEDCOIN]: { basePrice: 0.1, volatility: 0.15 },
  [CryptoType.GREENTOKEN]: { basePrice: 5, volatility: 0.04 }
}

function getCurrentPrice(cryptoType: CryptoType): number {
  const config = CRYPTO_CONFIG[cryptoType]
  const randomFactor = 1 + (Math.random() - 0.5) * 2 * config.volatility
  return config.basePrice * randomFactor
}

// POST /api/crypto/sell - Sell crypto
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
    const totalRevenue = price * amount

    // Get user's wallet
    const wallet = await db.cryptoWallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!wallet) {
      return new NextResponse("Wallet not found", { status: 404 })
    }

    // Check balance
    const balanceField = {
      [CryptoType.ORB]: 'orbBalance',
      [CryptoType.BITGOLD]: 'bitgoldBalance',
      [CryptoType.ETHEREUM_PLUS]: 'ethereumPlusBalance',
      [CryptoType.SPEEDCOIN]: 'speedcoinBalance',
      [CryptoType.GREENTOKEN]: 'greentokenBalance'
    }[cryptoType as CryptoType]

    const currentBalance = Number(wallet[balanceField as keyof typeof wallet])

    if (currentBalance < amount) {
      return NextResponse.json({
        success: false,
        message: "Solde crypto insuffisant",
        required: amount,
        balance: currentBalance
      }, { status: 400 })
    }

    // Get user's main account
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    if (!mainAccount) {
      return new NextResponse("No main account found", { status: 404 })
    }

    // Update wallet balance
    await db.cryptoWallet.update({
      where: { userId: session.user.id },
      data: {
        [balanceField]: {
          decrement: amount
        }
      }
    })

    // Add to bank account
    await db.bankAccount.update({
      where: { id: mainAccount.id },
      data: { balance: { increment: totalRevenue } }
    })

    // Create transaction record
    await db.cryptoTransaction.create({
      data: {
        userId: session.user.id,
        cryptoWalletId: wallet.id,
        type: 'SELL',
        cryptoType: cryptoType as CryptoType,
        amount,
        pricePerUnit: price,
        totalValue: totalRevenue
      }
    })

    // Create bank transaction
    await db.transaction.create({
      data: {
        accountId: mainAccount.id,
        type: "DEPOSIT",
        amount: totalRevenue,
        description: `Vente crypto: ${cryptoType}`
      }
    })

    return NextResponse.json({
      success: true,
      cryptoType,
      amount,
      pricePerUnit: price,
      totalRevenue,
      newBalance: Number(mainAccount.balance) + totalRevenue
    })

  } catch (error) {
    console.error("Error selling crypto:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
