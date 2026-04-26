// Real-world companies data for Ørbis market
// Prices and market caps are scaled for game balance

export interface RealStock {
  symbol: string
  name: string
  realPrice: number // Real world price in USD
  realMarketCap: number // Real market cap in billions USD
  sector: string
  description: string
  gamePrice: number // Scaled price for Ørbis
  totalShares: number
  volatility: "low" | "medium" | "high"
  trend: "up" | "down" | "neutral"
}

// Top tech companies (FAANG + others)
const techStocks: RealStock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    realPrice: 185.0,
    realMarketCap: 2900,
    sector: "Technology",
    description: "Designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories.",
    gamePrice: 1850,
    totalShares: 10000,
    volatility: "low",
    trend: "up"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    realPrice: 420.0,
    realMarketCap: 3100,
    sector: "Technology",
    description: "Develops, licenses, and supports software, services, devices, and solutions worldwide.",
    gamePrice: 4200,
    totalShares: 10000,
    volatility: "low",
    trend: "up"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    realPrice: 175.0,
    realMarketCap: 2200,
    sector: "Technology",
    description: "Provides online advertising services, search engine, cloud computing, software, and hardware.",
    gamePrice: 1750,
    totalShares: 10000,
    volatility: "medium",
    trend: "up"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    realPrice: 180.0,
    realMarketCap: 1900,
    sector: "Consumer/Technology",
    description: "Engages in the retail sale of consumer products and subscriptions worldwide.",
    gamePrice: 1800,
    totalShares: 10000,
    volatility: "medium",
    trend: "neutral"
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    realPrice: 505.0,
    realMarketCap: 1300,
    sector: "Technology",
    description: "Develops social media applications including Facebook, Instagram, Messenger, and WhatsApp.",
    gamePrice: 5050,
    totalShares: 8000,
    volatility: "high",
    trend: "up"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    realPrice: 245.0,
    realMarketCap: 780,
    sector: "Automotive/Energy",
    description: "Designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems.",
    gamePrice: 2450,
    totalShares: 8000,
    volatility: "high",
    trend: "neutral"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    realPrice: 875.0,
    realMarketCap: 2150,
    sector: "Technology/Semiconductors",
    description: "Designs graphics processing units (GPUs) for gaming and professional markets.",
    gamePrice: 8750,
    totalShares: 6000,
    volatility: "high",
    trend: "up"
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    realPrice: 635.0,
    realMarketCap: 275,
    sector: "Entertainment",
    description: "Provides subscription streaming entertainment service with TV series, documentaries, and feature films.",
    gamePrice: 6350,
    totalShares: 6000,
    volatility: "medium",
    trend: "up"
  }
]

// Automotive companies
const autoStocks: RealStock[] = [
  {
    symbol: "TM",
    name: "Toyota Motor Corp.",
    realPrice: 240.0,
    realMarketCap: 320,
    sector: "Automotive",
    description: "Manufactures and sells motor vehicles and related parts worldwide.",
    gamePrice: 2400,
    totalShares: 8000,
    volatility: "low",
    trend: "neutral"
  },
  {
    symbol: "VWAGY",
    name: "Volkswagen AG",
    realPrice: 13.0,
    realMarketCap: 65,
    sector: "Automotive",
    description: "German multinational automotive manufacturing corporation.",
    gamePrice: 130,
    totalShares: 15000,
    volatility: "medium",
    trend: "down"
  },
  {
    symbol: "RACE",
    name: "Ferrari N.V.",
    realPrice: 435.0,
    realMarketCap: 78,
    sector: "Automotive/Luxury",
    description: "Luxury sports car manufacturer based in Maranello, Italy.",
    gamePrice: 4350,
    totalShares: 4000,
    volatility: "medium",
    trend: "up"
  }
]

// Financial/Banking
const financeStocks: RealStock[] = [
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    realPrice: 200.0,
    realMarketCap: 575,
    sector: "Financial Services",
    description: "American multinational investment bank and financial services holding company.",
    gamePrice: 2000,
    totalShares: 10000,
    volatility: "low",
    trend: "up"
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    realPrice: 280.0,
    realMarketCap: 590,
    sector: "Financial Services",
    description: "Global payments technology company enabling digital payments.",
    gamePrice: 2800,
    totalShares: 9000,
    volatility: "low",
    trend: "up"
  },
  {
    symbol: "MA",
    name: "Mastercard Inc.",
    realPrice: 470.0,
    realMarketCap: 440,
    sector: "Financial Services",
    description: "Technology company in the global payments industry.",
    gamePrice: 4700,
    totalShares: 8000,
    volatility: "low",
    trend: "up"
  },
  {
    symbol: "BRK.B",
    name: "Berkshire Hathaway Inc.",
    realPrice: 415.0,
    realMarketCap: 900,
    sector: "Conglomerate",
    description: "Multinational conglomerate holding company led by Warren Buffett.",
    gamePrice: 4150,
    totalShares: 8000,
    volatility: "low",
    trend: "up"
  }
]

// Healthcare/Pharma
const healthStocks: RealStock[] = [
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    realPrice: 145.0,
    realMarketCap: 350,
    sector: "Healthcare",
    description: "Research and development, manufacture and sale of health products.",
    gamePrice: 1450,
    totalShares: 9000,
    volatility: "low",
    trend: "neutral"
  },
  {
    symbol: "LLY",
    name: "Eli Lilly and Co.",
    realPrice: 725.0,
    realMarketCap: 690,
    sector: "Pharmaceuticals",
    description: "Discovers, develops, manufactures and sells products in human pharmaceutical products segment.",
    gamePrice: 7250,
    totalShares: 5000,
    volatility: "medium",
    trend: "up"
  },
  {
    symbol: "PFE",
    name: "Pfizer Inc.",
    realPrice: 28.0,
    realMarketCap: 155,
    sector: "Pharmaceuticals",
    description: "Discovers, develops, manufactures, markets, distributes and sells biopharmaceutical products.",
    gamePrice: 280,
    totalShares: 20000,
    volatility: "medium",
    trend: "down"
  }
]

// Energy
const energyStocks: RealStock[] = [
  {
    symbol: "XOM",
    name: "Exxon Mobil Corp.",
    realPrice: 120.0,
    realMarketCap: 475,
    sector: "Energy",
    description: "Explores for and produces crude oil and natural gas worldwide.",
    gamePrice: 1200,
    totalShares: 10000,
    volatility: "medium",
    trend: "neutral"
  },
  {
    symbol: "SHEL",
    name: "Shell plc",
    realPrice: 70.0,
    realMarketCap: 210,
    sector: "Energy",
    description: "British multinational oil and gas company headquartered in London.",
    gamePrice: 700,
    totalShares: 12000,
    volatility: "medium",
    trend: "neutral"
  }
]

// Consumer/Retail
const consumerStocks: RealStock[] = [
  {
    symbol: "WMT",
    name: "Walmart Inc.",
    realPrice: 95.0,
    realMarketCap: 780,
    sector: "Retail",
    description: "Operates retail, wholesale and other units worldwide.",
    gamePrice: 950,
    totalShares: 12000,
    volatility: "low",
    trend: "up"
  },
  {
    symbol: "COST",
    name: "Costco Wholesale Corp.",
    realPrice: 870.0,
    realMarketCap: 385,
    sector: "Retail",
    description: "Operates membership warehouses in the United States and internationally.",
    gamePrice: 8700,
    totalShares: 5000,
    volatility: "low",
    trend: "up"
  },
  {
    symbol: "KO",
    name: "Coca-Cola Co.",
    realPrice: 62.0,
    realMarketCap: 265,
    sector: "Beverages",
    description: "Manufactures, markets, and sells nonalcoholic beverages worldwide.",
    gamePrice: 620,
    totalShares: 15000,
    volatility: "low",
    trend: "neutral"
  },
  {
    symbol: "MCD",
    name: "McDonald's Corp.",
    realPrice: 295.0,
    realMarketCap: 215,
    sector: "Food/Restaurants",
    description: "Operates and franchises McDonald's restaurants globally.",
    gamePrice: 2950,
    totalShares: 8000,
    volatility: "low",
    trend: "up"
  }
]

// Entertainment/Media
const entertainmentStocks: RealStock[] = [
  {
    symbol: "DIS",
    name: "Walt Disney Co.",
    realPrice: 110.0,
    realMarketCap: 200,
    sector: "Entertainment",
    description: "Entertainment company with media networks, parks, studio entertainment and direct-to-consumer services.",
    gamePrice: 1100,
    totalShares: 10000,
    volatility: "medium",
    trend: "neutral"
  },
  {
    symbol: "SPOT",
    name: "Spotify Technology S.A.",
    realPrice: 330.0,
    realMarketCap: 65,
    sector: "Entertainment",
    description: "Audio streaming and media services provider.",
    gamePrice: 3300,
    totalShares: 6000,
    volatility: "high",
    trend: "up"
  }
]

// Aerospace/Defense
const aerospaceStocks: RealStock[] = [
  {
    symbol: "BA",
    name: "Boeing Co.",
    realPrice: 180.0,
    realMarketCap: 135,
    sector: "Aerospace/Defense",
    description: "Designs, develops, manufactures, sales, services and supports commercial jetliners and military aircraft.",
    gamePrice: 1800,
    totalShares: 10000,
    volatility: "high",
    trend: "neutral"
  },
  {
    symbol: "LMT",
    name: "Lockheed Martin Corp.",
    realPrice: 460.0,
    realMarketCap: 115,
    sector: "Aerospace/Defense",
    description: "Security and aerospace company engaged in research, design, development and manufacture.",
    gamePrice: 4600,
    totalShares: 5000,
    volatility: "low",
    trend: "neutral"
  }
]

// Combine all stocks
export const allRealStocks: RealStock[] = [
  ...techStocks,
  ...autoStocks,
  ...financeStocks,
  ...healthStocks,
  ...energyStocks,
  ...consumerStocks,
  ...entertainmentStocks,
  ...aerospaceStocks
]

// Get stocks by sector
export function getStocksBySector(sector: string): RealStock[] {
  return allRealStocks.filter(stock => stock.sector === sector)
}

// Get top stocks by market cap
export function getTopStocks(limit: number = 10): RealStock[] {
  return [...allRealStocks]
    .sort((a, b) => b.realMarketCap - a.realMarketCap)
    .slice(0, limit)
}

// Get stocks by trend
export function getStocksByTrend(trend: "up" | "down" | "neutral"): RealStock[] {
  return allRealStocks.filter(stock => stock.trend === trend)
}

// Simulate price movement based on volatility
export function simulatePriceMovement(stock: RealStock): number {
  const volatilityFactor = stock.volatility === "high" ? 0.05 : stock.volatility === "medium" ? 0.02 : 0.01
  const change = (Math.random() - 0.5) * 2 * volatilityFactor
  return stock.gamePrice * (1 + change)
}

// Get sector performance
export function getSectorPerformance(): { sector: string; performance: number; stocks: number }[] {
  const sectors = new Set(allRealStocks.map(s => s.sector))
  return Array.from(sectors).map(sector => {
    const stocks = allRealStocks.filter(s => s.sector === sector)
    const avgPerformance = stocks.reduce((acc, s) => {
      const perf = s.trend === "up" ? Math.random() * 5 + 1 : s.trend === "down" ? -(Math.random() * 5 + 1) : (Math.random() - 0.5) * 2
      return acc + perf
    }, 0) / stocks.length
    return { sector, performance: avgPerformance, stocks: stocks.length }
  })
}
