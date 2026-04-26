import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const VICTORY_FORTUNE_THRESHOLD = 1000000000 // 1BØ
const VICTORY_RANK_THRESHOLD = 1 // Top 1 Forbes

// GET /api/victory/check - Check if user has achieved victory
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Check if victory already exists
    const existingVictory = await db.victory.findUnique({
      where: { userId: session.user.id }
    })

    if (existingVictory) {
      return NextResponse.json({
        hasVictory: true,
        victory: existingVictory
      })
    }

    // Get Forbes ranking
    const forbesRanking = await db.forbesRanking.findUnique({
      where: { userId: session.user.id }
    })

    if (!forbesRanking) {
      return NextResponse.json({
        hasVictory: false,
        message: "Forbes ranking not calculated yet"
      })
    }

    // Check victory conditions
    const fortuneCondition = Number(forbesRanking.totalFortune) >= VICTORY_FORTUNE_THRESHOLD
    const rankCondition = forbesRanking.currentRank === VICTORY_RANK_THRESHOLD

    const hasVictory = fortuneCondition && rankCondition

    if (hasVictory) {
      // Calculate statistics
      const businessesCount = await db.business.count({
        where: { userId: session.user.id }
      })

      const transactionsCount = await db.transaction.count({
        where: {
          account: {
            userId: session.user.id
          }
        }
      })

      // Create victory record
      const victory = await db.victory.create({
        data: {
          userId: session.user.id,
          achievedAt: new Date(),
          finalFortune: forbesRanking.totalFortune,
          finalRank: forbesRanking.currentRank,
          totalPlayTime: 0, // TODO: Track actual play time
          businessesOwned: businessesCount,
          totalTransactions: transactionsCount,
          title: "Magnat Suprême",
          bonusReward: 1000000 // 1MØ bonus
        }
      })

      // Add bonus to main account
      const mainAccount = await db.bankAccount.findFirst({
        where: { userId: session.user.id, isMain: true }
      })

      if (mainAccount) {
        await db.bankAccount.update({
          where: { id: mainAccount.id },
          data: { balance: { increment: 1000000 } }
        })

        await db.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: "DEPOSIT",
            amount: 1000000,
            description: "Bonus de victoire: Magnat Suprême"
          }
        })
      }

      return NextResponse.json({
        hasVictory: true,
        victory,
        message: "🎉 FÉLICITATIONS ! Vous êtes devenu le Magnat Suprême de Ørbis !"
      })
    }

    // Return progress toward victory
    const fortuneProgress = (Number(forbesRanking.totalFortune) / VICTORY_FORTUNE_THRESHOLD) * 100
    const rankProgress = forbesRanking.currentRank <= 100 ? ((100 - forbesRanking.currentRank) / 99) * 100 : 0

    return NextResponse.json({
      hasVictory: false,
      progress: {
        fortune: {
          current: Number(forbesRanking.totalFortune),
          target: VICTORY_FORTUNE_THRESHOLD,
          progress: Math.min(fortuneProgress, 100)
        },
        rank: {
          current: forbesRanking.currentRank,
          target: VICTORY_RANK_THRESHOLD,
          progress: Math.min(rankProgress, 100)
        }
      },
      message: fortuneCondition ? "Fortune atteinte ! Il faut être Top 1 Forbes" : 
                rankCondition ? "Top 1 atteint ! Il faut atteindre 1BØ" :
                "Continuez à progresser vers la victoire"
    })

  } catch (error) {
    console.error("Error checking victory:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
