"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Landmark, MapPin, Wallet, TrendingUp, Lightbulb, Orbit, Users } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface DashboardData {
  user: {
    id: string
    name: string
    identifier: string
    bankAccounts: { balance: number }[]
    location: { city: { name: string } } | null
    business: { name: string; capital: number } | null
  }
  stats: {
    totalUsers: number
    totalBusinesses: number
    totalSuggestions: number
    marketCap: number
  }
}

// Check if we're in the browser
const isBrowser = typeof window !== "undefined"

// Safe hook that handles prerendering
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
        <div className="flex flex-col items-center gap-4">
          <Orbit className="w-12 h-12 text-orbe animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const mainBalance = data?.user.bankAccounts[0]?.balance || 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bonjour, {data?.user.name}</h1>
          <p className="text-muted-foreground">Voici votre tableau de bord Ørbis</p>
        </div>
        <div className="glass rounded-xl px-6 py-3">
          <p className="text-sm text-muted-foreground">Solde principal</p>
          <p className="text-2xl font-bold text-orbe">{formatCurrency(mainBalance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Utilisateurs" value={data?.stats.totalUsers || 0} />
        <StatCard icon={Building2} label="Entreprises" value={data?.stats.totalBusinesses || 0} />
        <StatCard icon={Lightbulb} label="Suggestions" value={data?.stats.totalSuggestions || 0} />
        <StatCard icon={TrendingUp} label="Cap. Boursière" value={formatCurrency(data?.stats.marketCap || 0)} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/business" className="glass rounded-2xl p-6 hover:transform hover:scale-105 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orbe/10 rounded-xl">
              <Building2 className="w-6 h-6 text-orbe" />
            </div>
            <h2 className="text-xl font-semibold">Mon Entreprise</h2>
          </div>
          {data?.user.business ? (
            <div className="space-y-2">
              <p className="font-medium">{data.user.business.name}</p>
              <p className="text-sm text-muted-foreground">
                Capital: {formatCurrency(Number(data.user.business.capital))}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">Aucune entreprise</p>
              <p className="text-sm text-orbe">Créer une entreprise →</p>
            </div>
          )}
        </Link>

        <Link href="/bank" className="glass rounded-2xl p-6 hover:transform hover:scale-105 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Landmark className="w-6 h-6 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold">Ma Banque</h2>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{formatCurrency(mainBalance)}</p>
            <p className="text-sm text-muted-foreground">{data?.user.bankAccounts.length || 0} compte(s)</p>
          </div>
        </Link>

        <Link href="/map" className="glass rounded-2xl p-6 hover:transform hover:scale-105 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">Ma Position</h2>
          </div>
          <div className="space-y-2">
            {data?.user.location ? (
              <p className="font-medium">{data.user.location.city?.name || "Non définie"}</p>
            ) : (
              <p className="text-muted-foreground">Non définie</p>
            )}
            <p className="text-sm text-orbe">Voir la carte →</p>
          </div>
        </Link>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction href="/suggestions" icon={Lightbulb} label="Proposer une idée" />
          <QuickAction href="/market" icon={TrendingUp} label="Voir la bourse" />
          <QuickAction href="/bank" icon={Wallet} label="Faire un virement" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="glass rounded-xl p-4">
      <Icon className="w-5 h-5 text-muted-foreground mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors text-sm font-medium">
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}
