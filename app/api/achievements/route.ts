import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { AchievementCategory } from "@prisma/client"

// Achievement definitions from the document
const ACHIEVEMENT_DEFINITIONS = [
  // Fortune Progression
  { number: 1, name: "Premier Pas", description: "Gagner 100\u00D8 via mini-jeux", category: "FORTUNE", conditionType: "fortune", conditionValue: "100", rewardType: "BONUS", rewardValue: "50" },
  { number: 2, name: "Centenaire", description: "Atteindre 100Ø de fortune", category: "FORTUNE", conditionType: "fortune", conditionValue: "100", rewardType: "BADGE", rewardValue: "bronze" },
  { number: 3, name: "Millénium", description: "Atteindre 1.000Ø", category: "FORTUNE", conditionType: "fortune", conditionValue: "1000", rewardType: "BONUS", rewardValue: "100" },
  { number: 4, name: "Décamillénium", description: "Atteindre 10.000Ø", category: "FORTUNE", conditionType: "fortune", conditionValue: "10000", rewardType: "BADGE", rewardValue: "argent" },
  { number: 5, name: "Centenaire²", description: "Atteindre 100.000Ø", category: "FORTUNE", conditionType: "fortune", conditionValue: "100000", rewardType: "BONUS", rewardValue: "1000" },
  { number: 6, name: "Millionnaire", description: "Atteindre 1.000.000Ø", category: "FORTUNE", conditionType: "fortune", conditionValue: "1000000", rewardType: "BADGE", rewardValue: "or" },
  { number: 7, name: "Dix-Millionnaire", description: "Atteindre 10.000.000Ø", category: "FORTUNE", conditionType: "fortune", conditionValue: "10000000", rewardType: "BONUS", rewardValue: "10000" },
  { number: 8, name: "Cent-Millionnaire", description: "Atteindre 100.000.000Ø", category: "FORTUNE", conditionType: "fortune", conditionValue: "100000000", rewardType: "BADGE", rewardValue: "platine" },
  { number: 9, name: "Milliardaire", description: "Atteindre 1.000.000.000Ø", category: "FORTUNE", conditionType: "fortune", conditionValue: "1000000000", rewardType: "BONUS", rewardValue: "100000" },
  { number: 10, name: "Multi-Milliardaire", description: "Atteindre 10.000.000.000Ø", category: "FORTUNE", conditionType: "fortune", conditionValue: "10000000000", rewardType: "BADGE", rewardValue: "diamant" },
  
  // Forbes Ranking
  { number: 13, name: "Top 10.000", description: "Entrer dans le classement Forbes", category: "FORBES", conditionType: "forbes_rank", conditionValue: "10000", rewardType: "BADGE", rewardValue: "Débutant" },
  { number: 14, name: "Top 5.000", description: "Atteindre le rang 5.000", category: "FORBES", conditionType: "forbes_rank", conditionValue: "5000", rewardType: "BONUS", rewardValue: "500" },
  { number: 15, name: "Top 2.000", description: "Atteindre le rang 2.000", category: "FORBES", conditionType: "forbes_rank", conditionValue: "2000", rewardType: "BADGE", rewardValue: "En progression" },
  { number: 16, name: "Top 1.000", description: "Atteindre le rang 1.000", category: "FORBES", conditionType: "forbes_rank", conditionValue: "1000", rewardType: "BONUS", rewardValue: "1000" },
  { number: 19, name: "Top 100", description: "Atteindre le rang 100", category: "FORBES", conditionType: "forbes_rank", conditionValue: "100", rewardType: "BADGE", rewardValue: "Élite" },
  { number: 26, name: "TOP 1 FORBES", description: "Devenir la personne la plus riche", category: "FORBES", conditionType: "forbes_rank", conditionValue: "1", rewardType: "TITLE", rewardValue: "Magnat Suprême" },
  
  // Business Creation
  { number: 29, name: "Entrepreneur", description: "Créer sa première entreprise", category: "BUSINESS", conditionType: "business_count", conditionValue: "1", rewardType: "BONUS", rewardValue: "100" },
  { number: 30, name: "Serial Entrepreneur", description: "Créer 5 entreprises", category: "BUSINESS", conditionType: "business_count", conditionValue: "5", rewardType: "BADGE", rewardValue: "Multi-actif" },
  { number: 31, name: "Empire Builder", description: "Créer 10 entreprises", category: "BUSINESS", conditionType: "business_count", conditionValue: "10", rewardType: "BONUS", rewardValue: "500" },
  { number: 32, name: "Conglomérat", description: "Créer 25 entreprises", category: "BUSINESS", conditionType: "business_count", conditionValue: "25", rewardType: "BADGE", rewardValue: "Magnat" },
  
  // Employees
  { number: 33, name: "Premier Recrutement", description: "Embaucher votre premier employé", category: "BUSINESS", conditionType: "employee_count", conditionValue: "1", rewardType: "BONUS", rewardValue: "200" },
  { number: 34, name: "Équipe de 5", description: "Avoir 5 employés", category: "BUSINESS", conditionType: "employee_count", conditionValue: "5", rewardType: "BADGE", rewardValue: "Manager" },
  { number: 35, name: "Direction Comité", description: "Avoir 20 employés", category: "BUSINESS", conditionType: "employee_count", conditionValue: "20", rewardType: "BONUS", rewardValue: "1000" },
  { number: 36, name: "Formation Continue", description: "Former un employé au niveau 10", category: "BUSINESS", conditionType: "max_employee_level", conditionValue: "10", rewardType: "BADGE", rewardValue: "Mentor" },
  
  // Retail & Fashion
  { number: 41, name: "Fashion Victim", description: "Créer une entreprise de vêtements", category: "RETAIL", conditionType: "business_type", conditionValue: "CLOTHING", rewardType: "SKIN", rewardValue: "fashion" },
  { number: 42, name: "King of Fast Fashion", description: "Avoir 10 boutiques de mode", category: "RETAIL", conditionType: "business_subtype_count", conditionValue: "10", rewardType: "BADGE", rewardValue: "Mode" },
  { number: 43, name: "Luxe Éternel", description: "Créer une marque de luxe", category: "RETAIL", conditionType: "business_subtype", conditionValue: "LUXURY", rewardType: "BONUS", rewardValue: "1000" },
  { number: 44, name: "Boisson Énergisante", description: "Créer une entreprise de boissons", category: "RETAIL", conditionType: "business_type", conditionValue: "BEVERAGES", rewardType: "SKIN", rewardValue: "energy" },
  { number: 45, name: "Coca du Pauvre", description: "Vendre 1M de boissons", category: "RETAIL", conditionType: "total_sales_units", conditionValue: "1000000", rewardType: "BONUS", rewardValue: "500" },
  { number: 46, name: "Foodie", description: "Créer un restaurant", category: "RETAIL", conditionType: "business_subtype", conditionValue: "RESTAURANT", rewardType: "BADGE", rewardValue: "Chef" },
  { number: 47, name: "McRich", description: "Avoir 20 fast-foods", category: "RETAIL", conditionType: "business_subtype_count", conditionValue: "20", rewardType: "BONUS", rewardValue: "2000" },
  
  // Tech & Software
  { number: 52, name: "Coder", description: "Créer un SaaS", category: "TECH", conditionType: "business_subtype", conditionValue: "SAAS", rewardType: "BADGE", rewardValue: "Dev" },
  { number: 53, name: "Unicorn Hunter", description: "Avoir un SaaS valorisé 1MØ", category: "TECH", conditionType: "business_valuation", conditionValue: "1000000", rewardType: "BONUS", rewardValue: "10000" },
  { number: 54, name: "Hardware Hero", description: "Créer une entreprise hardware", category: "TECH", conditionType: "business_subtype", conditionValue: "HARDWARE", rewardType: "SKIN", rewardValue: "hardware" },
  { number: 56, name: "Game Dev", description: "Créer un studio de jeux", category: "TECH", conditionType: "business_subtype", conditionValue: "GAME_STUDIO", rewardType: "BADGE", rewardValue: "Gamer" },
  { number: 57, name: "Hit Maker", description: "Avoir un jeu viral (+10.000Ø/h)", category: "TECH", conditionType: "hourly_revenue", conditionValue: "10000", rewardType: "BONUS", rewardValue: "20000" },
  
  // Trading & Crypto
  { number: 113, name: "Day Trader", description: "Faire 100 trades", category: "CRYPTO", conditionType: "trade_count", conditionValue: "100", rewardType: "BONUS", rewardValue: "500" },
  { number: 114, name: "Swing Master", description: "Gain 100kØ sur un swing", category: "CRYPTO", conditionType: "single_trade_profit", conditionValue: "100000", rewardType: "BONUS", rewardValue: "1000" },
  { number: 116, name: "HODLer", description: "Garder une crypto 1 an", category: "CRYPTO", conditionType: "hold_duration_days", conditionValue: "365", rewardType: "BADGE", rewardValue: "Patient" },
  { number: 117, name: "Bitcoin Millionaire", description: "Fortune 1MØ en crypto", category: "CRYPTO", conditionType: "crypto_value", conditionValue: "1000000", rewardType: "BONUS", rewardValue: "10000" },
  { number: 120, name: "Altcoin Hunter", description: "Posséder 10 cryptos différentes", category: "CRYPTO", conditionType: "crypto_types_owned", conditionValue: "10", rewardType: "BADGE", rewardValue: "Diversifié" },
  
  // R&D & Patents
  { number: 60, name: "Chercheur", description: "Démarrer une recherche R&D", category: "TECH", conditionType: "research_started", conditionValue: "1", rewardType: "BONUS", rewardValue: "500" },
  { number: 61, name: "Innovateur", description: "Compléter 5 technologies", category: "TECH", conditionType: "technologies_completed", conditionValue: "5", rewardType: "BADGE", rewardValue: "Innovateur" },
  { number: 62, name: "Breveté", description: "Obtenir un brevet", category: "TECH", conditionType: "patents_owned", conditionValue: "1", rewardType: "BONUS", rewardValue: "2000" },
  { number: 63, name: "Edison", description: "Avoir 10 brevets actifs", category: "TECH", conditionType: "patents_owned", conditionValue: "10", rewardType: "BADGE", rewardValue: "Inventeur" },
  
  // B2B & Supply Chain
  { number: 65, name: "Fournisseur", description: "Signer premier contrat B2B", category: "BUSINESS", conditionType: "b2b_contracts", conditionValue: "1", rewardType: "BONUS", rewardValue: "300" },
  { number: 66, name: "Partenaire Majeur", description: "Avoir 10 clients B2B", category: "BUSINESS", conditionType: "b2b_clients", conditionValue: "10", rewardType: "BADGE", rewardValue: "Fournisseur" },
  { number: 67, name: "Volume d'Or", description: "1MØ de revenus B2B", category: "BUSINESS", conditionType: "b2b_revenue", conditionValue: "1000000", rewardType: "BONUS", rewardValue: "5000" },
  
  // Franchises
  { number: 99, name: "Franchisor", description: "Créer première franchise", category: "BUSINESS", conditionType: "franchise_count", conditionValue: "1", rewardType: "BONUS", rewardValue: "500" },
  { number: 100, name: "Franchise King", description: "Avoir 10 franchisés", category: "BUSINESS", conditionType: "franchise_count", conditionValue: "10", rewardType: "BONUS", rewardValue: "2000" },
  { number: 101, name: "McDonald Style", description: "Avoir 100 franchisés", category: "BUSINESS", conditionType: "franchise_count", conditionValue: "100", rewardType: "BADGE", rewardValue: "Franchise" },
  
  // Real Estate
  { number: 70, name: "Promoteur", description: "Démarrer un projet immobilier", category: "BUSINESS", conditionType: "construction_projects", conditionValue: "1", rewardType: "BONUS", rewardValue: "1000" },
  { number: 71, name: "Gratte-Ciel", description: "Construire un immeuble de 20+ étages", category: "BUSINESS", conditionType: "max_floors", conditionValue: "20", rewardType: "BADGE", rewardValue: "Architecte" },
  { number: 72, name: "Gentrificateur", description: "Développer 5 quartiers", category: "BUSINESS", conditionType: "districts_developed", conditionValue: "5", rewardType: "BONUS", rewardValue: "10000" },
  
  // Transport & Fleet
  { number: 75, name: "Chauffeur", description: "Acheter premier véhicule", category: "BUSINESS", conditionType: "vehicle_count", conditionValue: "1", rewardType: "BONUS", rewardValue: "200" },
  { number: 76, name: "Flotte", description: "Avoir 10 véhicules", category: "BUSINESS", conditionType: "vehicle_count", conditionValue: "10", rewardType: "BADGE", rewardValue: "Transporteur" },
  { number: 77, name: "Avionneur", description: "Acheter un avion", category: "BUSINESS", conditionType: "aircraft_owned", conditionValue: "1", rewardType: "BONUS", rewardValue: "5000" },
  { number: 78, name: "Compagnie Aérienne", description: "Avoir 10 avions", category: "BUSINESS", conditionType: "aircraft_count", conditionValue: "10", rewardType: "BADGE", rewardValue: "Aviation" },
  
  // Stock Market
  { number: 105, name: "IPO Baby", description: "Coter première entreprise", category: "BUSINESS", conditionType: "ipo_completed", conditionValue: "1", rewardType: "BONUS", rewardValue: "2000" },
  { number: 106, name: "Wall Street", description: "Avoir 3 entreprises cotées", category: "BUSINESS", conditionType: "listed_companies", conditionValue: "3", rewardType: "BONUS", rewardValue: "5000" },
  { number: 108, name: "Bull Market", description: "Cours actions ×2 en 1 an", category: "BUSINESS", conditionType: "stock_doubled", conditionValue: "1", rewardType: "BONUS", rewardValue: "10000" },
  { number: 112, name: "Oracle of Omaha", description: "Rendement 50%/an sur 5 ans", category: "BUSINESS", conditionType: "annual_return_5years", conditionValue: "50", rewardType: "BONUS", rewardValue: "50000" },
  
  // Special Milestones
  { number: 80, name: "Diversifié", description: "Posséder 5 secteurs différents", category: "BUSINESS", conditionType: "sectors_owned", conditionValue: "5", rewardType: "BADGE", rewardValue: "Diversifié" },
  { number: 81, name: "Spécialiste Tech", description: "5 entreprises tech", category: "TECH", conditionType: "tech_businesses", conditionValue: "5", rewardType: "BADGE", rewardValue: "Tech Guru" },
  { number: 82, name: "Spécialiste Retail", description: "5 entreprises retail", category: "RETAIL", conditionType: "retail_businesses", conditionValue: "5", rewardType: "BONUS", rewardValue: "500" },
]

// GET /api/achievements - Get user's achievements
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Seed achievements if not exists
    const existingCount = await db.achievement.count()
    if (existingCount === 0) {
      for (const def of ACHIEVEMENT_DEFINITIONS) {
        await db.achievement.create({
          data: {
            number: def.number,
            name: def.name,
            description: def.description,
            category: def.category as AchievementCategory,
            conditionType: def.conditionType,
            conditionValue: def.conditionValue,
            rewardType: def.rewardType as any,
            rewardValue: def.rewardValue
          }
        })
      }
    }

    // Get user's achievements
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true
      }
    })

    // Get all achievements for progress calculation
    const allAchievements = await db.achievement.findMany({
      orderBy: { number: "asc" }
    })

    // Calculate user's current fortune
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })
    const currentFortune = mainAccount ? Number(mainAccount.balance) : 0

    // Get Forbes rank
    const forbesRanking = await db.forbesRanking.findUnique({
      where: { userId: session.user.id }
    })
    const currentRank = forbesRanking?.currentRank || 10000

    // Get business count
    const businessCount = await db.business.count({
      where: { userId: session.user.id }
    })

    // Calculate progress for each achievement
    const achievementsWithProgress = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
      let progress = 0
      let unlocked = false

      if (userAchievement) {
        unlocked = true
        progress = 1
      } else {
        // Calculate progress based on condition type
        switch (achievement.conditionType) {
          case "fortune":
            const targetFortune = Number(achievement.conditionValue)
            progress = Math.min(currentFortune / targetFortune, 1)
            break
          case "forbes_rank":
            const targetRank = Number(achievement.conditionValue)
            progress = currentRank <= targetRank ? 1 : Math.max(0, (10000 - currentRank) / (10000 - targetRank))
            break
          case "business_count":
            const targetCount = Number(achievement.conditionValue)
            progress = Math.min(businessCount / targetCount, 1)
            break
        }
      }

      return {
        ...achievement,
        unlocked,
        progress
      }
    })

    return NextResponse.json({
      achievements: achievementsWithProgress,
      stats: {
        unlocked: userAchievements.length,
        total: allAchievements.length,
        currentFortune,
        currentRank,
        businessCount
      }
    })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/achievements/check - Check and unlock achievements
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { achievementId } = await req.json()
    
    if (!achievementId) {
      return new NextResponse("Missing achievement ID", { status: 400 })
    }

    // Check if already unlocked
    const existing = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: session.user.id,
          achievementId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ success: false, message: "Already unlocked" })
    }

    // Get achievement
    const achievement = await db.achievement.findUnique({
      where: { id: achievementId }
    })

    if (!achievement) {
      return new NextResponse("Achievement not found", { status: 404 })
    }

    // Check condition (simplified - in production, this would be more sophisticated)
    let conditionMet = false
    const mainAccount = await db.bankAccount.findFirst({
      where: { userId: session.user.id, isMain: true }
    })
    const currentFortune = mainAccount ? Number(mainAccount.balance) : 0

    switch (achievement.conditionType) {
      case "fortune":
        conditionMet = currentFortune >= Number(achievement.conditionValue)
        break
      // Add more condition types as needed
    }

    if (!conditionMet) {
      return NextResponse.json({ success: false, message: "Condition not met" })
    }

    // Unlock achievement
    const userAchievement = await db.userAchievement.create({
      data: {
        userId: session.user.id,
        achievementId,
        unlockedAt: new Date(),
        progress: 1
      }
    })

    // Grant reward if bonus
    if (achievement.rewardType === "BONUS" && achievement.rewardValue) {
      const bonusAmount = Number(achievement.rewardValue)
      if (mainAccount) {
        await db.bankAccount.update({
          where: { id: mainAccount.id },
          data: { balance: { increment: bonusAmount } }
        })

        await db.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: "DEPOSIT",
            amount: bonusAmount,
            description: `Bonus achievement: ${achievement.name}`
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      userAchievement,
      message: `Achievement unlocked: ${achievement.name}`
    })

  } catch (error) {
    console.error("Error unlocking achievement:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
