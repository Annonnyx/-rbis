// ============================================
// app/market/page.tsx
// Bourse avec 3 onglets : Entreprises, Portfolio, Annonces
// ============================================

import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { getUserAccounts } from '@/app/actions/bank'
import { 
  getMarketData, 
  getUserPortfolio, 
  getActiveListings,
  type ListedCompany,
  type UserHolding,
  type ActiveListing,
} from '@/app/actions/market'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { StockChart } from '@/components/StockChart'
import { PortfolioRow } from '@/components/PortfolioRow'
import { ShareListingCard } from '@/components/ShareListingCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { 
  TrendingUp, 
  PieChart, 
  ShoppingCart, 
  ArrowRight,
  TrendingDown,
  Activity,
  Package
} from 'lucide-react'
import { getResourceTypes } from '@/app/actions/production'
import { prisma } from '@/lib/prisma'
import { OrbeCurrency } from '@/components/OrbeCurrency'

interface MarketPageProps {
  searchParams: { tab?: string }
}

// ============================================
// Onglet 1: Entreprises cotées
// ============================================
async function CompaniesTab({ userId, userBalance }: { userId: string; userBalance: bigint }) {
  const result = await getMarketData()
  
  if (!result.success) {
    return <div className="text-red-400">Erreur lors du chargement du marché</div>
  }
  
  const companies = result.data || []
  
  if (companies.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Aucune entreprise cotée"
        description="Soyez le premier à introduire votre entreprise en bourse !"
        action={
          <Link href="/dashboard">
            <Button>Voir mes entreprises</Button>
          </Link>
        }
      />
    )
  }
  
  return (
    <div className="space-y-4">
      {companies.map((company: ListedCompany) => {
        const shareInfo = company.shareInfo
        const prices = company.priceHistory || []
        const lastPrice = prices[prices.length - 1]?.price || shareInfo?.currentPrice || 0n
        const firstPrice = prices[0]?.price || lastPrice
        const priceChange = firstPrice > 0n 
          ? Number((lastPrice - firstPrice) * 100n / firstPrice) 
          : 0
        
        return (
          <Link key={company.id} href={`/company/${company.id}`}>
            <GlassCard hover className="group">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info entreprise */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {company.name}
                    </h3>
                    <Badge variant="success">Cotée</Badge>
                  </div>
                  <p className="text-sm text-white/50 line-clamp-1">{company.objective}</p>
                  <p className="text-xs text-white/30 mt-1">
                    par {company.owner.displayName || company.owner.username}
                  </p>
                </div>
                
                {/* Mini graphique */}
                {prices.length > 1 && (
                  <div className="w-full lg:w-48 h-16">
                    <StockChart prices={prices} height={64} showArea={false} />
                  </div>
                )}
                
                {/* Prix et variation */}
                <div className="flex items-center gap-6 lg:w-48">
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      <OrbeCurrency amount={shareInfo?.currentPrice || 0n} />
                    </p>
                    <p className={`text-sm flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                    </p>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-violet-400 transition-colors" />
                </div>
              </div>
            </GlassCard>
          </Link>
        )
      })}
    </div>
  )
}

// ============================================
// Onglet 2: Mon portfolio
// ============================================
async function PortfolioTab({ userId, userBalance }: { userId: string; userBalance: bigint }) {
  const result = await getUserPortfolio(userId)
  
  if (!result.success) {
    return <div className="text-red-400">Erreur lors du chargement du portfolio</div>
  }
  
  const holdings = result.data || []
  const meta = (result as any).meta || {}
  
  if (holdings.length === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="Portfolio vide"
        description="Vous ne possédez encore aucune action. Visitez la bourse pour commencer à investir !"
        action={
          <Link href="/market?tab=companies">
            <Button>Voir les entreprises cotées</Button>
          </Link>
        }
      />
    )
  }
  
  const isProfit = meta.totalProfitLoss >= 0n
  
  return (
    <div className="space-y-6">
      {/* Stats portfolio */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard padding="md" className="text-center">
          <p className="text-xs text-white/40 mb-1">Valeur totale</p>
          <p className="text-xl font-bold text-white">
            <OrbeCurrency amount={meta.totalValue} />
          </p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <p className="text-xs text-white/40 mb-1">Investi</p>
          <p className="text-lg font-medium text-white">
            <OrbeCurrency amount={meta.totalInvested} />
          </p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <p className="text-xs text-white/40 mb-1">Variation</p>
          <p className={`text-lg font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            <OrbeCurrency amount={meta.totalProfitLoss} />
          </p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <p className="text-xs text-white/40 mb-1">Entreprises</p>
          <p className="text-2xl font-bold text-white">{meta.totalCompanies}</p>
        </GlassCard>
      </div>
      
      {/* Liste des holdings */}
      <div className="space-y-3">
        {holdings.map((holding: UserHolding) => (
          <PortfolioRow key={holding.companyId} holding={holding} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Onglet 3: Annonces du marché secondaire
// ============================================
async function ListingsTab({ userId }: { userId: string }) {
  const result = await getActiveListings()
  
  if (!result.success) {
    return <div className="text-red-400">Erreur lors du chargement des annonces</div>
  }
  
  const listings = result.data || []
  
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Aucune annonce"
        description="Le marché secondaire est vide. Vendez vos actions pour créer une annonce !"
        action={
          <Link href="/market?tab=portfolio">
            <Button>Voir mon portfolio</Button>
          </Link>
        }
      />
    )
  }
  
  return (
    <div className="space-y-4">
      {listings.map((listing: ActiveListing) => (
        <ShareListingCard
          key={listing.id}
          listing={listing}
          isOwn={listing.sellerId === userId}
          onBuy={() => {}}
        />
      ))}
    </div>
  )
}

// ============================================
// Onglet 4: Ressources
// ============================================
async function ResourcesTab() {
  const result = await getResourceTypes()
  
  if (!result.success) {
    return <div className="text-red-400">Erreur lors du chargement des ressources</div>
  }
  
  const resources = result.data || []
  
  if (resources.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucune ressource"
        description="Le marché des ressources est vide."
      />
    )
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {resources.map(resource => (
        <GlassCard key={resource.id} className="text-center">
          <p className="font-medium text-white">{resource.name}</p>
          <p className="text-xs text-white/40 mb-2">{resource.category}</p>
          <p className="text-lg font-bold text-violet-400">
            <OrbeCurrency amount={resource.basePrice} />
          </p>
          <p className="text-xs text-white/40">/{resource.unit}</p>
        </GlassCard>
      ))}
    </div>
  )
}

// ============================================
// Main Page
// ============================================
export default async function MarketPage({ searchParams }: MarketPageProps) {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  const activeTab = searchParams.tab || 'companies'
  
  // Récupérer le solde pour les actions d'achat
  const accountsResult = await getUserAccounts(user.id)
  const accounts = accountsResult.success ? accountsResult.accounts : []
  const personalAccount = accounts.find(a => a.ownerType === 'PERSONAL')
  const userBalance = personalAccount?.balance || 0n
  
  const tabs = [
    { id: 'companies', label: 'Entreprises cotées', icon: TrendingUp },
    { id: 'portfolio', label: 'Mes actions', icon: PieChart },
    { id: 'listings', label: 'Annonces', icon: ShoppingCart },
    { id: 'resources', label: 'Ressources', icon: Package },
  ]
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Bourse"
        description="Achetez, vendez et échangez des actions des entreprises Ørbis"
      />
      
      {/* Onglets */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <Link key={tab.id} href={`/market?tab=${tab.id}`}>
              <Button
                variant={isActive ? 'primary' : 'secondary'}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            </Link>
          )
        })}
      </div>
      
      {/* Contenu */}
      <Suspense fallback={<LoadingSkeleton variant="card" count={5} />}>
        {activeTab === 'companies' && (
          <CompaniesTab userId={user.id} userBalance={userBalance} />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioTab userId={user.id} userBalance={userBalance} />
        )}
        {activeTab === 'listings' && (
          <ListingsTab userId={user.id} />
        )}
        {activeTab === 'resources' && (
          <ResourcesTab />
        )}
      </Suspense>
    </div>
  )
}
