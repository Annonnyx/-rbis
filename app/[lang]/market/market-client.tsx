"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

interface Stock {
  id: string
  symbol: string
  currentPrice: number
  totalShares: number
  availableShares: number
  business: {
    name: string
    capital: number
  }
}

export function MarketClient() {
  const { data: session, status } = useSafeSession()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchStocks()
    }
  }, [status])

  const fetchStocks = async () => {
    try {
      const res = await fetch("/api/stocks")
      if (res.ok) {
        const data = await res.json()
        setStocks(data)
      }
    } catch (error) {
      console.error("Error fetching stocks:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <TrendingUp className="w-12 h-12 text-orbe animate-pulse" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Bourse</h1>
      
      {stocks.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune action disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((stock) => (
            <div key={stock.id} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl">{stock.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{stock.business.name}</p>
                </div>
                <div className="p-2 bg-orbe/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orbe" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-semibold">{formatCurrency(Number(stock.currentPrice))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disponibles</span>
                  <span className="font-semibold">{stock.availableShares} / {stock.totalShares}</span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-orbe text-white rounded-lg hover:bg-orbe-dark transition-colors">
                Acheter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
