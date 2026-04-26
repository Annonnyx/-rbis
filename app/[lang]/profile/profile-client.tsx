"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  User, Mail, MapPin, Building2, Wallet, TrendingUp,
  LogOut, Edit2, Copy, CheckCircle2, Shield, Sparkles
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { signOut } from "next-auth/react"

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

interface ProfileData {
  id: string
  name: string
  email: string
  identifier: string
  emailVerified: boolean
  location: {
    city: {
      name: string
      country: string
    }
  } | null
  business: {
    name: string
    capital: number
  } | null
  bankAccounts: {
    id: string
    balance: number
  }[]
  portfolio: {
    stock: {
      symbol: string
      currentPrice: number
    }
    shares: number
  }[]
  createdAt: string
}

export function ProfileClient() {
  const { data: session, status } = useSafeSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile")
      if (res.ok) {
        setProfile(await res.json())
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyIdentifier = () => {
    if (profile?.identifier) {
      navigator.clipboard.writeText(profile.identifier)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })
      if (res.ok) {
        fetchProfile()
        setShowEditProfile(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const totalBalance = (profile?.bankAccounts || []).reduce((acc, accnt) => acc + Number(accnt?.balance || 0), 0)
  const portfolioValue = (profile?.portfolio || []).reduce((acc, item) => acc + ((item?.shares || 0) * Number(item?.stock?.currentPrice || 0)), 0)

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <User className="w-16 h-16 text-primary/60 animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (showEditProfile) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-2 gradient-text">Modifier le profil</h1>
        <p className="text-muted-foreground mb-6">Mettez à jour vos informations personnelles</p>
        
        <form onSubmit={handleEditProfile} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Prénom</label>
              <input
                type="text"
                required
                value={editFormData.firstName}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 glass-input rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Nom</label>
              <input
                type="text"
                required
                value={editFormData.lastName}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                placeholder="Votre nom"
                className="w-full px-4 py-3 glass-input rounded-xl"
              />
            </div>
          </GlassCard>
          
          <div className="flex gap-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowEditProfile(false)} className="flex-1">
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1">
              Enregistrer
            </GlassButton>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles</p>
        </div>
        <GlassButton onClick={() => signOut({ callbackUrl: "/" })} variant="secondary">
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </GlassButton>
      </div>

      {/* Profile Card */}
      <GlassCard liquid className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {profile?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-green-500 rounded-full border-2 border-background">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1">{profile?.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-3">
              <Mail className="w-4 h-4" />
              <span>{profile?.email}</span>
              {profile?.emailVerified && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">
                  Vérifié
                </span>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-sm text-muted-foreground">ID:</span>
              <code className="px-2 py-1 bg-accent rounded text-sm font-mono">
                {profile?.identifier}
              </code>
              <button
                onClick={copyIdentifier}
                className="p-1.5 hover:bg-accent rounded transition-colors"
              >
                {copiedId ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          <GlassButton variant="secondary" onClick={() => setShowEditProfile(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </GlassButton>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Wallet className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Solde bancaire</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          <p className="text-xs text-muted-foreground">{profile?.bankAccounts.length || 0} compte(s)</p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Portefeuille boursier</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
          <p className="text-xs text-muted-foreground">{profile?.portfolio.length || 0} position(s)</p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">Entreprise</span>
          </div>
          {profile?.business ? (
            <>
              <p className="text-lg font-semibold truncate">{profile.business.name}</p>
              <p className="text-xs text-muted-foreground">
                Capital: {formatCurrency(Number(profile.business.capital))}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune entreprise</p>
          )}
        </GlassCard>
      </div>

      {/* Location & Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Localisation
          </h3>
          {profile?.location ? (
            <div className="space-y-2">
              <p className="font-medium">{profile.location.city.name}</p>
              <p className="text-sm text-muted-foreground">{profile.location.city.country}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune localisation définie</p>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Informations du compte
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membre depuis</span>
              <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("fr-FR") : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email vérifié</span>
              <span>{profile?.emailVerified ? "Oui" : "Non"}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Portfolio Preview */}
      {profile?.portfolio && profile.portfolio.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="font-semibold mb-4">Mes actions</h3>
          <div className="space-y-3">
            {profile.portfolio.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-accent/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.stock.symbol}</p>
                    <p className="text-xs text-muted-foreground">{item.shares} actions</p>
                  </div>
                </div>
                <p className="font-semibold">
                  {formatCurrency(item.shares * Number(item.stock.currentPrice))}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
