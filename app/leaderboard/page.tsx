// ============================================
// app/leaderboard/page.tsx
// Page des classements
// ============================================

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
import { 
  getWealthLeaderboard, 
  getEntrepreneursLeaderboard,
  getInvestorsLeaderboard,
  getCitizensLeaderboard,
  getProductionLeaderboard,
  type LeaderboardEntry,
} from '@/app/actions/leaderboard'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { MapPin, Crown, TrendingUp, Users, Building2, DollarSign, Vote, Factory } from 'lucide-react'

export default async function LeaderboardPage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer les villes pour le filtre
  const locations = await prisma.mapLocation.findMany({
    where: { unlocked: true },
    select: { id: true, name: true },
  })
  
  // Récupérer tous les classements
  const [wealth, entrepreneurs, investors, citizens, production] = await Promise.all([
    getWealthLeaderboard(50),
    getEntrepreneursLeaderboard(50),
    getInvestorsLeaderboard(50),
    getCitizensLeaderboard(50),
    getProductionLeaderboard(50),
  ])
  
  const renderLeaderboard = (data: LeaderboardEntry[]) => {
    if (data.length === 0) {
      return <p className="text-center text-white/50 py-8">Aucune donnée disponible</p>
    }
    
    return (
      <div className="space-y-2">
        {data.map((entry, index) => (
          <GlassCard 
            key={entry.userId} 
            className={`${entry.userId === user.id ? 'border-violet-500/50' : ''}`}
            padding="sm"
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-amber-500/20 text-amber-400' :
                index === 1 ? 'bg-gray-300/20 text-gray-300' :
                index === 2 ? 'bg-orange-600/20 text-orange-400' :
                'bg-white/10 text-white/60'
              }`}>
                {index + 1}
              </div>
              
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <span className="text-violet-400 font-medium">
                  {(entry.displayName || entry.username).charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/profile/${entry.username}`}
                    className="font-medium text-white hover:text-violet-300"
                  >
                    {entry.displayName || entry.username}
                  </Link>
                  {entry.hasLegendaryBadge && (
                    <Crown className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-white/40 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {entry.location || 'Inconnu'}
                </p>
              </div>
              
              {/* Value */}
              <div className="text-right">
                <p className="font-medium text-white">
                  {typeof entry.value === 'bigint' ? (
                    <OrbeCurrency amount={entry.value} />
                  ) : (
                    entry.value.toLocaleString('fr-FR')
                  )}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }
  
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Classements"
        description="Les meilleurs joueurs d'Ørbis"
      />
      
      <Tabs defaultValue="wealth">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="wealth" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Richesse
          </TabsTrigger>
          <TabsTrigger value="entrepreneurs" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Entrepreneurs
          </TabsTrigger>
          <TabsTrigger value="investors" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Investisseurs
          </TabsTrigger>
          <TabsTrigger value="citizens" className="flex items-center gap-2">
            <Vote className="w-4 h-4" />
            Citoyens
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Factory className="w-4 h-4" />
            Production
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wealth">
          <GlassCard className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-violet-400" />
              <h2 className="font-semibold text-white">Richesse totale</h2>
            </div>
            <p className="text-sm text-white/50">Classement par solde total sur tous les comptes</p>
          </GlassCard>
          {renderLeaderboard(wealth.success ? (wealth.data ?? []) : [])}
        </TabsContent>
        
        <TabsContent value="entrepreneurs">
          <GlassCard className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-violet-400" />
              <h2 className="font-semibold text-white">Entrepreneurs</h2>
            </div>
            <p className="text-sm text-white/50">Classement par nombre d'entreprises et capital</p>
          </GlassCard>
          {renderLeaderboard(entrepreneurs.success ? (entrepreneurs.data ?? []) : [])}
        </TabsContent>
        
        <TabsContent value="investors">
          <GlassCard className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              <h2 className="font-semibold text-white">Investisseurs</h2>
            </div>
            <p className="text-sm text-white/50">Classement par valeur du portfolio d'actions</p>
          </GlassCard>
          {renderLeaderboard(investors.success ? (investors.data ?? []) : [])}
        </TabsContent>
        
        <TabsContent value="citizens">
          <GlassCard className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Vote className="w-5 h-5 text-violet-400" />
              <h2 className="font-semibold text-white">Citoyens engagés</h2>
            </div>
            <p className="text-sm text-white/50">Classement par votes et participation</p>
          </GlassCard>
          {renderLeaderboard(citizens.success ? (citizens.data ?? []) : [])}
        </TabsContent>
        
        <TabsContent value="production">
          <GlassCard className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Factory className="w-5 h-5 text-violet-400" />
              <h2 className="font-semibold text-white">Producteurs</h2>
            </div>
            <p className="text-sm text-white/50">Classement par volume total produit</p>
          </GlassCard>
          {renderLeaderboard(production.success ? (production.data ?? []) : [])}
        </TabsContent>
      </Tabs>
    </div>
  )
}
