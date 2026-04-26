import { NextResponse } from "next/server"
import { BusinessType, BusinessSubType } from "@prisma/client"

// Business types and subtypes configuration
const BUSINESS_TYPES_CONFIG: Partial<Record<BusinessType, {
  name: string
  icon: string
  subtypes: { value: BusinessSubType; name: string; cost: number; revenue: number; difficulty: number }[]
}>> = {
  [BusinessType.CLOTHING]: {
    name: "Vêtements",
    icon: "👕",
    subtypes: [
      { value: BusinessSubType.FAST_FASHION, name: "Fast Fashion", cost: 1000, revenue: 80, difficulty: 2 },
      { value: BusinessSubType.READY_TO_WEAR, name: "Prêt-à-porter", cost: 2000, revenue: 120, difficulty: 2 },
      { value: BusinessSubType.LUXURY, name: "Luxe & Haute couture", cost: 8000, revenue: 250, difficulty: 4 },
      { value: BusinessSubType.SPORTSWEAR, name: "Sportswear", cost: 1500, revenue: 100, difficulty: 2 },
      { value: BusinessSubType.ECO_FRIENDLY, name: "Éco-responsable", cost: 2500, revenue: 150, difficulty: 3 }
    ]
  },
  [BusinessType.ENERGY_DRINKS]: {
    name: "Boissons Énergisantes",
    icon: "⚡",
    subtypes: [
      { value: BusinessSubType.ARTISANAL, name: "Artisanale/Local", cost: 2000, revenue: 120, difficulty: 2 },
      { value: BusinessSubType.INDUSTRIAL, name: "Industrielle", cost: 5000, revenue: 220, difficulty: 4 },
      { value: BusinessSubType.PREMIUM_BIO, name: "Premium/Bio", cost: 3000, revenue: 180, difficulty: 3 },
      { value: BusinessSubType.GAMING, name: "Gaming/Esport", cost: 2500, revenue: 150, difficulty: 3 }
    ]
  },
  [BusinessType.ELECTRONICS]: {
    name: "Électronique",
    icon: "📱",
    subtypes: [
      { value: BusinessSubType.RETAIL, name: "Retail", cost: 3000, revenue: 150, difficulty: 2 },
      { value: BusinessSubType.REPAIR, name: "Réparation", cost: 1500, revenue: 100, difficulty: 2 },
      { value: BusinessSubType.MANUFACTURING, name: "Manufacturing", cost: 10000, revenue: 300, difficulty: 4 }
    ]
  },
  [BusinessType.FOOD_BEVERAGE]: {
    name: "Alimentation",
    icon: "🍔",
    subtypes: [
      { value: BusinessSubType.RESTAURANT, name: "Restaurant", cost: 5000, revenue: 200, difficulty: 3 },
      { value: BusinessSubType.FAST_FOOD, name: "Fast Food", cost: 3000, revenue: 150, difficulty: 2 },
      { value: BusinessSubType.CAFE, name: "Café", cost: 2000, revenue: 100, difficulty: 2 },
      { value: BusinessSubType.BAKERY, name: "Boulangerie", cost: 1500, revenue: 80, difficulty: 2 }
    ]
  },
  [BusinessType.SAAS]: {
    name: "SaaS",
    icon: "☁️",
    subtypes: [
      { value: BusinessSubType.RETAIL, name: "B2B SaaS", cost: 15000, revenue: 500, difficulty: 4 },
      { value: BusinessSubType.MANUFACTURING, name: "B2C SaaS", cost: 10000, revenue: 350, difficulty: 3 }
    ]
  },
  [BusinessType.AIRLINE]: {
    name: "Compagnie Aérienne",
    icon: "✈️",
    subtypes: [
      { value: BusinessSubType.RETAIL, name: "Low Cost", cost: 50000, revenue: 800, difficulty: 5 },
      { value: BusinessSubType.MANUFACTURING, name: "Premium", cost: 100000, revenue: 1500, difficulty: 5 }
    ]
  },
  [BusinessType.CASINO]: {
    name: "Casino",
    icon: "🎰",
    subtypes: [
      { value: BusinessSubType.RETAIL, name: "Casino", cost: 200000, revenue: 2000, difficulty: 5 }
    ]
  }
}

// GET /api/business/types - Get all business types and subtypes
export async function GET() {
  return NextResponse.json(BUSINESS_TYPES_CONFIG)
}
