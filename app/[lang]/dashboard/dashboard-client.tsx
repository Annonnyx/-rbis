"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  Building2, Landmark, MapPin, Wallet, TrendingUp, Lightbulb, 
  Orbit, Users, ArrowUpRight, Sparkles, Zap, Globe,
  ChevronRight, BarChart3, PiggyBank
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"

interface DashboardData {
  user: {
    id: string
    name: string
    identifier: string
    bankAccounts: { balance: number }[]
    location: { city: { name: string } } | null
    business: { name: string; capital: number; isActive: boolean } | null
    portfolio: { stock: { symbol: string; currentPrice: number }; shares: number }[]
  }
  stats: {
    totalUsers: number
    totalBusinesses: number
    totalSuggestions: number
    marketCap: number
    totalTransactions: number
  }
  recentActivity: {
    type: string
    description: string
    amount?: number
    createdAt: string
  }[]
}

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

export function DashboardClient() {
  const { data: session, status } = useSafeSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard")
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Orbit className="w-16 h-16 text-primary/60 animate-spin" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const mainBalance = data?.user.bankAccounts[0]?.balance || 0
  const totalBankBalance = data?.user.bankAccounts.reduce((acc, accnt) => acc + Number(accnt.balance), 0) || 0
  const portfolioValue = data?.user.portfolio.reduce((acc, item) => acc + (item.shares * Number(item.stock.currentPrice)), 0) || 0
  const totalWealth = totalBankBalance + portfolioValue

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Bienvenue sur Ørbis</span>
          </div>
          <h1 className="text-3xl font-bold">Bonjour, {data?.user.name}</h1>
          <p className="text-muted-foreground">Voici votre tableau de bord</p>
        </div>
        <GlassCard liquid className="px-6 py-4">
          <p className="text-sm text-muted-foreground">Patrimoine total</p>
          <p className="text-3xl font-bold gradient-text">{formatCurrency(totalWealth)}</p>
        </GlassCard>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Wallet} 
          label="En banque" 
          value={formatCurrency(totalBankBalance)}
          color="blue"
        />
        <StatCard 
          icon={TrendingUp} 
          label="En bourse" 
          value={formatCurrency(portfolioValue)}
          color="green"
        />
        <StatCard 
          icon={Building2} 
          label="Capital entreprise" 
          value={formatCurrency(data?.user.business?.capital || 0)}
          color="purple"
        />
        <StatCard 
          icon={Globe} 
          label="Utilisateurs Ørbis" 
          value={data?.stats.totalUsers || 0}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <QuickAction href="/bank" icon={Send} label="Transférer" primary />
        <QuickAction href="/market" icon={TrendingUp} label="Trader" />
        <QuickAction href="/business" icon={Building2} label="Mon entreprise" />
        <QuickAction href="/suggestions" icon={Lightbulb} label="Suggérer" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Card */}
          <Link href="/business">
            <GlassCard liquid className="p-6 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Mon Entreprise</h2>
                    {data?.user.business ? (
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${data.user.business.isActive ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-muted-foreground">{data.user.business.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Aucune entreprise créée</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              {data?.user.business ? (
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Capital</p>
                    <p className="text-xl font-semibold">{formatCurrency(Number(data.user.business.capital))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className={`text-sm font-medium ${data.user.business.isActive ? "text-green-500" : "text-red-500"}`}>
                      {data.user.business.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm text-primary">Créez votre entreprise pour 300 Ø →</p>
                </div>
              )}
            </GlassCard>
          </Link>

          {/* Bank & Portfolio Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/bank">
              <GlassCard className="p-6 group cursor-pointer h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Landmark className="w-6 h-6 text-green-500" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">Ma Banque</h3>
                <p className="text-2xl font-bold">{formatCurrency(totalBankBalance)}</p>
                <p className="text-sm text-muted-foreground">{data?.user.bankAccounts.length || 0} compte(s)</p>
              </GlassCard>
            </Link>

            <Link href="/market">
              <GlassCard className="p-6 group cursor-pointer h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">Ma Bourse</h3>
                <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
                <p className="text-sm text-muted-foreground">{data?.user.portfolio.length || 0} position(s)</p>
              </GlassCard>
            </Link>
          </div>

          {/* Global Stats */}
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Statistiques Ørbis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-background/50">
                <p className="text-2xl font-bold">{data?.stats.totalUsers || 0}</p>
                <p className="text-xs text-muted-foreground">Utilisateurs</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/50">
                <p className="text-2xl font-bold">{data?.stats.totalBusinesses || 0}</p>
                <p className="text-xs text-muted-foreground">Entreprises</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/50">
                <p className="text-2xl font-bold">{data?.stats.totalSuggestions || 0}</p>
                <p className="text-xs text-muted-foreground">Suggestions</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-background/50">
                <p className="text-2xl font-bold">{formatCurrency(data?.stats.marketCap || 0)}</p>
                <p className="text-xs text-muted-foreground">Cap. Boursière</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Location Card */}
          <Link href="/map">
            <GlassCard className="p-5 group cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-semibold">Ma Position</h3>
              </div>
              {data?.user.location ? (
                <p className="text-muted-foreground">{data.user.location.city?.name || "Non définie"}</p>
              ) : (
                <p className="text-sm text-primary">Définir ma position →</p>
              )}
            </GlassCard>
          </Link>

          {/* Recent Activity */}
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Activité récente
            </h3>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.type === "DEPOSIT" || activity.type === "SALE" 
                        ? "bg-green-500/10" 
                        : "bg-red-500/10"
                    }`}>
                      {activity.type === "DEPOSIT" || activity.type === "SALE" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-500 rotate-180" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {activity.amount && (
                      <p className={`text-sm font-medium ${
                        activity.type === "DEPOSIT" || activity.type === "SALE"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}>
                        {activity.type === "DEPOSIT" || activity.type === "SALE" ? "+" : "-"}
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune activité récente
              </p>
            )}
          </GlassCard>

          {/* Portfolio Preview */}
          {data?.user.portfolio && data.user.portfolio.length > 0 && (
            <GlassCard className="p-5">
              <h3 className="font-semibold mb-4">Mes actions</h3>
              <div className="space-y-2">
                {data.user.portfolio.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <TrendingUp className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-medium">{item.stock.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.shares} actions</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.shares * Number(item.stock.currentPrice))}
                      </p>
                    </div>
                  </div>
                ))}
                {data.user.portfolio.length > 3 && (
                  <Link href="/market">
                    <p className="text-sm text-primary text-center mt-2 hover:underline">
                      Voir tout le portefeuille →
                    </p>
                  </Link>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
    primary: "bg-primary/10 text-primary",
  }

  return (
    <GlassCard className="p-4">
      <div className={`p-2 rounded-lg w-fit mb-3 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-lg font-bold truncate">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </GlassCard>
  )
}

function QuickAction({ href, icon: Icon, label, primary }: { href: string; icon: any; label: string; primary?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
        primary
          ? "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          : "glass-button hover:scale-105"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}

// Icon component for QuickAction
function Send({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
