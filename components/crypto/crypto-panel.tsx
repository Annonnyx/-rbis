"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { TrendingUp, TrendingDown, Zap, DollarSign, Activity, Cpu } from "lucide-react"

interface CryptoWallet {
  orbBalance: number
  bitgoldBalance: number
  ethereumPlusBalance: number
  speedcoinBalance: number
  greentokenBalance: number
  totalValue: number
}

interface CryptoPrices {
  ORB: number
  BITGOLD: number
  ETHEREUM_PLUS: number
  SPEEDCOIN: number
  GREENTOKEN: number
}

export function CryptoPanel() {
  const [wallet, setWallet] = useState<CryptoWallet | null>(null)
  const [prices, setPrices] = useState<CryptoPrices | null>(null)
  const [selectedCrypto, setSelectedCrypto] = useState<string>("ORB")
  const [amount, setAmount] = useState<string>("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/crypto/wallet")
      if (res.ok) {
        const data = await res.json()
        setWallet(data.wallet)
        setPrices(data.prices)
      }
    } catch (error) {
      console.error("Error fetching wallet:", error)
    }
  }

  useEffect(() => {
    fetchWallet()
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchWallet, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    setLoading(true)
    try {
      const res = await fetch("/api/crypto/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cryptoType: selectedCrypto, amount: parseFloat(amount) })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: "success", text: `Achat réussi: ${amount} ${selectedCrypto}` })
        setAmount("")
        fetchWallet()
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de l'achat" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    } finally {
      setLoading(false)
    }
  }

  const handleSell = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    setLoading(true)
    try {
      const res = await fetch("/api/crypto/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cryptoType: selectedCrypto, amount: parseFloat(amount) })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: "success", text: `Vente réussie: ${amount} ${selectedCrypto}` })
        setAmount("")
        fetchWallet()
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de la vente" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur réseau" })
    } finally {
      setLoading(false)
    }
  }

  const cryptoList = [
    { id: "ORB", name: "\u00D8RB", icon: "🪙", color: "text-yellow-500" },
    { id: "BITGOLD", name: "BitGold", icon: "🥇", color: "text-orange-500" },
    { id: "ETHEREUM_PLUS", name: "Ethereum++", icon: "💎", color: "text-purple-500" },
    { id: "SPEEDCOIN", name: "SpeedCoin", icon: "⚡", color: "text-blue-500" },
    { id: "GREENTOKEN", name: "GreenToken", icon: "🌱", color: "text-green-500" }
  ]

  const currentPrice = prices?.[selectedCrypto as keyof CryptoPrices] || 0
  const totalCost = amount ? parseFloat(amount) * currentPrice : 0

  return (
    <div className="space-y-6">
      {/* Total Portfolio Value */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Valeur totale du portefeuille</p>
            <p className="text-3xl font-bold">{wallet?.totalValue ? `${wallet.totalValue.toFixed(2)}\u00D8` : "0.00\u00D8"}</p>
          </div>
          <Activity className="w-8 h-8 text-primary" />
        </div>
      </GlassCard>

      {/* Crypto Selection */}
      <div className="grid grid-cols-5 gap-2">
        {cryptoList.map((crypto) => (
          <button
            key={crypto.id}
            onClick={() => setSelectedCrypto(crypto.id)}
            className={`p-3 rounded-lg border transition-all ${
              selectedCrypto === crypto.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-2xl mb-1">{crypto.icon}</div>
            <div className={`text-xs font-medium ${crypto.color}`}>{crypto.name}</div>
            <div className="text-xs text-muted-foreground">
              {prices?.[crypto.id as keyof CryptoPrices]?.toFixed(2)}\u00D8
            </div>
          </button>
        ))}
      </div>

      {/* Selected Crypto Details */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">
            {cryptoList.find(c => c.id === selectedCrypto)?.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              {cryptoList.find(c => c.id === selectedCrypto)?.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{currentPrice.toFixed(2)}\u00D8</span>
              <span className="text-sm text-green-500 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{(Math.random() * 5).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-xs text-muted-foreground">Votre solde</p>
            <p className="text-lg font-semibold">
              {wallet?.[`${selectedCrypto.toLowerCase()}Balance` as keyof CryptoWallet] 
                ? Number(wallet[`${selectedCrypto.toLowerCase()}Balance` as keyof CryptoWallet]).toFixed(4)
                : "0.0000"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-xs text-muted-foreground">Valeur en \u00D8</p>
            <p className="text-lg font-semibold">
              {wallet?.[`${selectedCrypto.toLowerCase()}Balance` as keyof CryptoWallet]
                ? (Number(wallet[`${selectedCrypto.toLowerCase()}Balance` as keyof CryptoWallet]) * currentPrice).toFixed(2)
                : "0.00"}\u00D8
            </p>
          </div>
        </div>

        {/* Trading Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Montant</label>
            <GlassInput
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.0001"
            />
          </div>

          {amount && (
            <div className="p-3 rounded-lg bg-primary/10">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{totalCost.toFixed(2)}\u00D8</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <GlassButton onClick={handleBuy} disabled={loading || !amount} variant="primary">
              <TrendingUp className="w-4 h-4 mr-2" />
              Acheter
            </GlassButton>
            <GlassButton onClick={handleSell} disabled={loading || !amount} variant="secondary">
              <TrendingDown className="w-4 h-4 mr-2" />
              Vendre
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        }`}>
          {message.text}
        </div>
      )}

      {/* Mining Section */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Mining Crypto</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Minez des cryptos passivement avec votre équipement
        </p>
        <GlassButton className="w-full">
          <Zap className="w-4 h-4 mr-2" />
          Démarrer le Mining
        </GlassButton>
      </GlassCard>
    </div>
  )
}
