import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { ForbesRankTier } from "@prisma/client"

// Simulated Forbes 100 characters
const FORBES_CHARACTERS = [
  { rank: 1, name: "Elon R. Mask", fortune: 1000000000, company: "SpaceLink", sector: "Tech" },
  { rank: 2, name: "Jeff B. Zos", fortune: 980000000, company: "E-Commerce Global", sector: "Retail" },
  { rank: 3, name: "Bernard A. Arno", fortune: 920000000, company: "LVMH Group", sector: "Luxe" },
  { rank: 4, name: "Bill G. Foundation", fortune: 890000000, company: "SoftMicro", sector: "Tech" },
  { rank: 5, name: "Warren B. Fett", fortune: 850000000, company: "BerkInvest", sector: "Finance" },
  { rank: 10, name: "Steve B. Malon", fortune: 690000000, company: "SoftMicro", sector: "Tech" },
  { rank: 25, name: "Pierre O. Midyar", fortune: 350000000, company: "AuctionNet", sector: "Tech" },
  { rank: 50, name: "Daniel E. Ek", fortune: 180000000, company: "StreamMusic", sector: "Tech" },
  { rank: 75, name: "Brian C. Acton", fortune: 95000000, company: "TalkApp", sector: "Tech" },
  { rank: 100, name: "Thomas D. Wealth", fortune: 5000000, company: "Local Business", sector: "Services" }
]

// GET /api/forbes - Get Forbes ranking
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Get or create user's Forbes ranking
    let forbesRanking = await db.forbesRanking.findUnique({
      where: { userId: session.user.id }
    })

    // Calculate user's total fortune
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })

    const cash = mainAccount ? Number(mainAccount.balance) : 0

    // Get stock portfolio value (simplified - using stockTrades)
    const stockTrades = await db.stockTrade.findMany({
      where: { buyerId: session.user.id },
      include: { stock: true }
    })

    const stocks = stockTrades.reduce((sum: number, t: any) => {
      return sum + (Number(t.shares) * Number(t.price))
    }, 0)

    // Get crypto wallet value
    const cryptoWallet = await db.cryptoWallet.findUnique({
      where: { userId: session.user.id }
    })

    const crypto = cryptoWallet ? Number(cryptoWallet.totalValue) : 0

    // Get business value (simplified)
    const business = await db.business.findUnique({
      where: { userId: session.user.id }
    })

    const businessValue = business ? Number(business.capital) * 5 : 0 // Simplified valuation

    const totalFortune = cash + stocks + crypto + businessValue

    // Calculate rank
    let currentRank = 10000
    let rankTier: ForbesRankTier = ForbesRankTier.OUTSIDE

    for (const character of FORBES_CHARACTERS) {
      if (totalFortune >= character.fortune) {
        currentRank = character.rank
        break
      }
    }

    // Determine tier
    if (currentRank === 1) rankTier = ForbesRankTier.NUMBER_1
    else if (currentRank <= 10) rankTier = ForbesRankTier.TOP_10
    else if (currentRank <= 25) rankTier = ForbesRankTier.TOP_25
    else if (currentRank <= 50) rankTier = ForbesRankTier.MID_50
    else if (currentRank <= 100) rankTier = ForbesRankTier.BOTTOM_100
    else rankTier = ForbesRankTier.OUTSIDE

    // Update or create ranking
    if (forbesRanking) {
      const previousRank = forbesRanking.currentRank
      const rankChange = previousRank - currentRank
      const fortuneChange = totalFortune - Number(forbesRanking.totalFortune)

      forbesRanking = await db.forbesRanking.update({
        where: { userId: session.user.id },
        data: {
          currentRank,
          previousRank,
          rankTier,
          totalFortune,
          cash,
          stocks,
          crypto,
          businessValue,
          rankChange,
          fortuneChange,
          lastUpdated: new Date()
        }
      })
    } else {
      forbesRanking = await db.forbesRanking.create({
        data: {
          userId: session.user.id,
          currentRank,
          previousRank: 10000,
          rankTier,
          totalFortune,
          cash,
          stocks,
          crypto,
          businessValue,
          rankChange: 0,
          fortuneChange: 0
        }
      })
    }

    // Combine with AI characters
    const fullRanking = [
      ...FORBES_CHARACTERS,
      {
        rank: currentRank,
        name: "Vous",
        fortune: totalFortune,
        company: business?.name || "N/A",
        sector: business?.type || "N/A",
        isPlayer: true
      }
    ].sort((a, b) => a.rank - b.rank)

    return NextResponse.json({
      ranking: forbesRanking,
      fullRanking: fullRanking.slice(0, 20) // Top 20
    })
  } catch (error) {
    console.error("Error fetching Forbes ranking:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
