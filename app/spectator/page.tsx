// ============================================
// app/spectator/page.tsx
// Mode spectateur - accès sans compte
// ============================================

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getGlobalLeaderboardSnapshot } from '@/app/actions/leaderboard'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { Crown, Globe, Users, Building2, TrendingUp, DollarSign, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SpectatorPage() {
  // Récupérer les stats globales
  const [
    totalUsers,
    totalCompanies,
    totalTransactions,
    totalOrbes,
    locations,
    leaderboardSnapshot,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.transaction.count(),
    prisma.bankAccount.aggregate({ _sum: { balance: true } }),
    prisma.mapLocation.findMany({
      where: { unlocked: true },
      select: { id: true, name: true, lat: true, lng: true },
    }),
    getGlobalLeaderboardSnapshot(),
  ])
  
  const topWealth = leaderboardSnapshot.success ? leaderboardSnapshot.data.wealth.slice(0, 10) : []
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Découvrez <span className="text-violet-400">Ørbis</span>
          </h1>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Un monde économique virtuel où créez des entreprises, investissez en bourse, 
            et collaborez avec d'autres joueurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Rejoindre Ørbis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="px-6 py-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Statistiques en temps réel
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <GlassCard padding="md" className="text-center">
            <Users className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{totalUsers}</p>
            <p className="text-sm text-white/50">Joueurs</p>
          </GlassCard>
          <GlassCard padding="md" className="text-center">
            <Building2 className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{totalCompanies}</p>
            <p className="text-sm text-white/50">Entreprises</p>
          </GlassCard>
          <GlassCard padding="md" className="text-center">
            <TrendingUp className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{totalTransactions}</p>
            <p className="text-sm text-white/50">Transactions</p>
          </GlassCard>
          <GlassCard padding="md" className="text-center">
            <DollarSign className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">
              <OrbeCurrency amount={totalOrbes._sum.balance || 0n} />
            </p>
            <p className="text-sm text-white/50">Orbes en circulation</p>
          </GlassCard>
        </div>
        
        {/* Map Preview */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-violet-400" />
              <h3 className="text-xl font-semibold text-white">Le monde d'Ørbis</h3>
            </div>
            <p className="text-white/60 mb-4">
              Explorez {locations.length} villes débloquées. Chaque ville a son propre 
              écosystème économique avec des entreprises, une bourse, et un gouvernement local.
            </p>
            <div className="flex flex-wrap gap-2">
              {locations.map(loc => (
                <Badge key={loc.id} variant="neutral">{loc.name}</Badge>
              ))}
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-semibold text-white">Top 10 Richesse</h3>
            </div>
            <div className="space-y-2">
              {topWealth.map((entry, index) => (
                <div 
                  key={entry.userId} 
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-500/20 text-amber-400' :
                      index === 1 ? 'bg-gray-300/20 text-gray-300' :
                      index === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-white">{entry.displayName || entry.username}</span>
                    {entry.hasLegendaryBadge && <Crown className="w-4 h-4 text-amber-400" />}
                  </div>
                  <span className="text-violet-400">
                    <OrbeCurrency amount={BigInt(entry.value)} />
                  </span>
                </div>
              ))}
              {topWealth.length === 0 && (
                <p className="text-center text-white/40 py-4">Aucune donnée disponible</p>
              )}
            </div>
          </GlassCard>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <GlassCard>
            <Building2 className="w-10 h-10 text-violet-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Créez votre empire</h3>
            <p className="text-white/60">
              Fondez des entreprises, produisez des ressources, et négociez des contrats 
              avec d'autres joueurs.
            </p>
          </GlassCard>
          <GlassCard>
            <TrendingUp className="w-10 h-10 text-violet-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Investissez en bourse</h3>
            <p className="text-white/60">
              Achetez et vendez des actions des entreprises cotées. Spéculez sur 
              les prix et diversifiez votre portfolio.
            </p>
          </GlassCard>
          <GlassCard>
            <Globe className="w-10 h-10 text-violet-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Participez à la vie civique</h3>
            <p className="text-white/60">
              Votez pour les représentants de votre ville, proposez des lois, et 
              influencez l'économie locale.
            </p>
          </GlassCard>
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <p className="text-white/60 mb-4">
            Prêt à commencer votre aventure économique ?
          </p>
          <Link href="/auth/register">
            <Button size="lg">
              Rejoindre Ørbis gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
