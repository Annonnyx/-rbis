"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  TrendingUp, TrendingDown, Building2, DollarSign, 
  ShoppingCart, ArrowUpRight, ArrowDownRight, BarChart3,
  PieChart, Activity, Clock, ChevronRight, Search
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"

interface Stock {
  id: string
  symbol: string
  currentPrice: number
  previousPrice?: number
  totalShares: number
  availableShares: number
  business: {
    id: string
    name: string
    capital: number
  }
}

interface Portfolio {
  id: string
  shares: number
  averagePrice: number
  stock: Stock
}

interface Transaction {
  id: string
  type: "BUY" | "SELL"
  shares: number
  price: number
  totalAmount: number
  createdAt: string
  stock: {
    symbol: string
    business: {
      name: string
    }
  }
}

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

export function MarketClient() {
  const { data: session, status } = useSafeSession()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"market" | "portfolio" | "history">("market")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [tradeForm, setTradeForm] = useState({
    shares: "",
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchMarketData()
    }
  }, [status])

  const fetchMarketData = async () => {
    try {
      const [stocksRes, portfolioRes, transactionsRes] = await Promise.all([
        fetch("/api/stocks"),
        fetch("/api/stocks/portfolio"),
        fetch("/api/stocks/transactions"),
      ])
      
      if (stocksRes.ok) {
        setStocks(await stocksRes.json())
      }
      if (portfolioRes.ok) {
        setPortfolio(await portfolioRes.json())
      }
      if (transactionsRes.ok) {
        setTransactions(await transactionsRes.json())
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStock) return
    
    try {
      const res = await fetch("/api/stocks/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockId: selectedStock.id,
          type: tradeType,
          shares: parseInt(tradeForm.shares),
        }),
      })
      
      if (res.ok) {
        fetchMarketData()
        setShowTradeModal(false)
        setSelectedStock(null)
        setTradeForm({ shares: "" })
      } else {
        const error = await res.json()
        alert(error.error || "Erreur lors de la transaction")
      }
    } catch (error) {
      console.error("Error trading:", error)
    }
  }

  const openTradeModal = (stock: Stock, type: "BUY" | "SELL") => {
    setSelectedStock(stock)
    setTradeType(type)
    setTradeForm({ shares: "" })
    setShowTradeModal(true)
  }

  const portfolioValue = portfolio.reduce((acc, item) => {
    return acc + (item.shares * Number(item.stock.currentPrice))
  }, 0)

  const portfolioCost = portfolio.reduce((acc, item) => {
    return acc + (item.shares * Number(item.averagePrice))
  }, 0)

  const portfolioProfit = portfolioValue - portfolioCost
  const portfolioProfitPercent = portfolioCost > 0 ? (portfolioProfit / portfolioCost) * 100 : 0

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.business.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <TrendingUp className="w-16 h-16 text-primary/60 animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (showTradeModal && selectedStock) {
    const totalAmount = parseInt(tradeForm.shares || "0") * Number(selectedStock.currentPrice)
    const maxShares = tradeType === "SELL" 
      ? portfolio.find(p => p.stock.id === selectedStock.id)?.shares || 0
      : Math.floor(Number(selectedStock.availableShares))

    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <GlassCard liquid className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {tradeType === "BUY" ? "Acheter" : "Vendre"} {selectedStock.symbol}
            </h2>
            <button
              onClick={() => setShowTradeModal(false)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-background/50">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{selectedStock.business.name}</p>
              <p className="text-sm text-muted-foreground">
                Prix: {formatCurrency(Number(selectedStock.currentPrice))}
              </p>
            </div>
          </div>

          {tradeType === "SELL" && (
            <p className="text-sm text-muted-foreground mb-4">
              Vous possédez {maxShares} action(s)
            </p>
          )}

          <form onSubmit={handleTrade} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Nombre d&apos;actions
              </label>
              <input
                type="number"
                required
                min="1"
                max={maxShares > 0 ? maxShares : undefined}
                value={tradeForm.shares}
                onChange={(e) => setTradeForm({ shares: e.target.value })}
                className="w-full px-4 py-3 glass-input rounded-xl text-lg"
                placeholder="0"
              />
            </div>

            <div className="p-4 rounded-xl bg-background/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix unitaire</span>
                <span>{formatCurrency(Number(selectedStock.currentPrice))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantité</span>
                <span>{tradeForm.shares || 0}</span>
              </div>
              <div className="border-t border-border/50 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className={tradeType === "BUY" ? "text-red-500" : "text-green-500"}>
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <GlassButton
                type="button"
                variant="ghost"
                onClick={() => setShowTradeModal(false)}
                className="flex-1"
              >
                Annuler
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                className={`flex-1 ${tradeType === "SELL" ? "!bg-red-500 hover:!bg-red-600" : ""}`}
              >
                {tradeType === "BUY" ? "Acheter" : "Vendre"}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Bourse</h1>
          <p className="text-muted-foreground">Achetez et vendez des actions</p>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard liquid className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Valeur du portefeuille</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
        </GlassCard>

        <GlassCard liquid className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${portfolioProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {portfolioProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">Profit/Perte</span>
          </div>
          <p className={`text-2xl font-bold ${portfolioProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
            {portfolioProfit >= 0 ? "+" : ""}{formatCurrency(portfolioProfit)}
          </p>
          <p className={`text-xs ${portfolioProfit >= 0 ? "text-green-500/70" : "text-red-500/70"}`}>
            {portfolioProfit >= 0 ? "+" : ""}{portfolioProfitPercent.toFixed(2)}%
          </p>
        </GlassCard>

        <GlassCard liquid className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Actions disponibles</span>
          </div>
          <p className="text-2xl font-bold">{stocks.reduce((acc, s) => acc + s.availableShares, 0)}</p>
        </GlassCard>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "market", label: "Marché", icon: BarChart3 },
          { id: "portfolio", label: "Mon portefeuille", icon: PieChart },
          { id: "history", label: "Historique", icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "glass-button"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Market Tab */}
      {activeTab === "market" && (
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une entreprise..."
                className="w-full pl-10 pr-4 py-3 glass-input rounded-xl"
              />
            </div>
          </div>

          {filteredStocks.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune action disponible pour le moment</p>
            </GlassCard>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStocks.map((stock) => {
                const userShares = portfolio.find(p => p.stock.id === stock.id)?.shares || 0
                const priceChange = stock.previousPrice 
                  ? ((Number(stock.currentPrice) - Number(stock.previousPrice)) / Number(stock.previousPrice)) * 100
                  : 0

                return (
                  <GlassCard key={stock.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl">{stock.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{stock.business.name}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-2xl font-bold">{formatCurrency(Number(stock.currentPrice))}</p>
                      {priceChange !== 0 && (
                        <p className={`text-sm ${priceChange > 0 ? "text-green-500" : "text-red-500"}`}>
                          {priceChange > 0 ? "+" : ""}{priceChange.toFixed(2)}%
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Disponibles</span>
                        <span className="font-medium">{stock.availableShares} / {stock.totalShares}</span>
                      </div>
                      {userShares > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vos actions</span>
                          <span className="font-medium text-primary">{userShares}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <GlassButton
                        onClick={() => openTradeModal(stock, "BUY")}
                        variant="primary"
                        className="flex-1"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Acheter
                      </GlassButton>
                      {userShares > 0 && (
                        <GlassButton
                          onClick={() => openTradeModal(stock, "SELL")}
                          variant="secondary"
                          className="flex-1 !bg-red-500/10 !text-red-500 hover:!bg-red-500/20"
                          size="sm"
                        >
                          Vendre
                        </GlassButton>
                      )}
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mon portefeuille</h2>
          
          {portfolio.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Vous ne possédez aucune action</p>
              <GlassButton onClick={() => setActiveTab("market")} variant="primary" className="mt-4">
                Explorer le marché
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {portfolio.map((item) => {
                const currentValue = item.shares * Number(item.stock.currentPrice)
                const costBasis = item.shares * Number(item.averagePrice)
                const profit = currentValue - costBasis
                const profitPercent = (profit / costBasis) * 100

                return (
                  <GlassCard key={item.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{item.stock.symbol}</p>
                          <p className="text-sm text-muted-foreground">{item.stock.business.name}</p>
                          <p className="text-xs text-muted-foreground">{item.shares} action(s)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(currentValue)}</p>
                        <p className={`text-sm ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {profit >= 0 ? "+" : ""}{formatCurrency(profit)} ({profitPercent.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                      <GlassButton
                        onClick={() => openTradeModal(item.stock, "BUY")}
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                      >
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        Acheter
                      </GlassButton>
                      <GlassButton
                        onClick={() => openTradeModal(item.stock, "SELL")}
                        variant="secondary"
                        size="sm"
                        className="flex-1 !bg-red-500/10 !text-red-500 hover:!bg-red-500/20"
                      >
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                        Vendre
                      </GlassButton>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Historique des transactions</h2>
          
          {transactions.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune transaction</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 20).map((transaction) => (
                <GlassCard key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === "BUY" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}>
                        {transaction.type === "BUY" ? (
                          <ArrowDownRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === "BUY" ? "Achat" : "Vente"} {transaction.stock.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.shares} action(s) à {formatCurrency(Number(transaction.price))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === "BUY" ? "text-red-500" : "text-green-500"}`}>
                        {transaction.type === "BUY" ? "-" : "+"}{formatCurrency(Number(transaction.totalAmount))}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
