// ============================================
// app/company/[id]/page.tsx
// Page détail d'une entreprise (avec section bourse)
// ============================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompanyById } from '@/app/actions/company'
import { getCurrentUser } from '@/app/actions/auth'
import { getCompanyTransactions, getPriceHistory } from '@/app/actions/market'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { TransactionRow } from '@/components/TransactionRow'
import { StockChart } from '@/components/StockChart'
import { EmptyState } from '@/components/EmptyState'
import { IPOButton } from '@/components/IPOButton'
import { BuySharesButton } from '@/components/BuySharesButton'
import { 
  Building2, MapPin, User, Calendar, Sparkles, TrendingUp, 
  TrendingDown, Activity, Users, DollarSign, Briefcase,
  Package, Factory, FileText
} from 'lucide-react'
import { getCompanyEmployees, getCompanyJobPostings, type JobWithDetails } from '@/app/actions/employment'
import { EmployeeRow } from '@/components/EmployeeRow'
import { JobCard } from '@/components/JobCard'
import { getProductionLines, getCompanyInventory, getCompanyContracts } from '@/app/actions/production'
import { ProgressBar } from '@/components/ProgressBar'

interface CompanyPageProps {
  params: { id: string }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const user = await getCurrentUser()
  const result = await getCompanyById(params.id)
  
  if (!result.success || !result.company) {
    notFound()
  }
  
  const company = result.company
  const isOwner = user?.id === company.ownerId
  
  // Récupérer les infos boursières si disponibles
  const shareInfo = await prisma.companyShare.findUnique({
    where: { companyId: params.id },
  })
  
  // Récupérer l'historique des prix si cotée
  const priceHistory = shareInfo?.isListed 
    ? await getPriceHistory(params.id, '7d')
    : null
  
  // Récupérer les transactions d'actions si cotée
  const shareTransactions = shareInfo?.isListed
    ? await getCompanyTransactions(params.id, 5)
    : null
  
  // Récupérer les données d'emploi
  const employeesResult = await getCompanyEmployees(params.id)
  const jobPostingsResult = await getCompanyJobPostings(params.id)
  const employees = employeesResult.success ? (employeesResult.data ?? []) : []
  const jobPostings: JobWithDetails[] = jobPostingsResult.success ? (jobPostingsResult.data ?? []) : []
  
  // Récupérer les données de production
  const productionResult = await getProductionLines(params.id)
  const inventoryResult = await getCompanyInventory(params.id)
  const providerContractsResult = await getCompanyContracts(params.id, true)
  const clientContractsResult = await getCompanyContracts(params.id, false)
  
  const productionLines = productionResult.success ? (productionResult.data ?? []) : []
  const inventory = inventoryResult.success ? (inventoryResult.data ?? []) : []
  const providerContracts = providerContractsResult.success ? (providerContractsResult.data ?? []) : []
  const clientContracts = clientContractsResult.success ? (clientContractsResult.data ?? []) : []
  
  const transactions = [
    ...company.capitalAccount.sentTransactions.map(t => ({ ...t, direction: 'out' as const })),
    ...company.capitalAccount.receivedTransactions.map(t => ({ ...t, direction: 'in' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{company.name}</h1>
            <Badge variant="violet">Entreprise</Badge>
            {shareInfo?.isListed && <Badge variant="success">Cotée</Badge>}
          </div>
          <p className="text-lg text-white/60">{company.objective}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {company.location.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Créée le {new Date(company.createdAt).toLocaleDateString('fr-FR')}
            </span>
            {shareInfo?.isListed && (
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-green-400" />
                En bourse
              </span>
            )}
          </div>
        </div>
        
        {/* Actions (si owner) */}
        <div className="flex gap-2">
          {!shareInfo?.isListed && isOwner && (
            <IPOButton 
              companyId={company.id}
              companyName={company.name}
              companyCapital={company.capitalAccount.balance}
            />
          )}
          <Button variant="secondary" size="sm">
            Modifier
          </Button>
        </div>
      </div>
      
      {/* Section Bourse (si cotée) */}
      {shareInfo?.isListed && (
        <GlassCard className="border-violet-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Bourse
            </h2>
            <Badge variant="success">Cotée en bourse</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/40 mb-1">Prix actuel</p>
              <p className="text-xl font-bold text-white">
                <OrbeCurrency amount={shareInfo.currentPrice} />
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/40 mb-1">Actions totales</p>
              <p className="text-xl font-bold text-white">{shareInfo.totalShares.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/40 mb-1">Disponibles</p>
              <p className="text-xl font-bold text-white">{shareInfo.availableShares.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-xs text-white/40 mb-1">Capitalisation</p>
              <p className="text-lg font-bold text-white">
                <OrbeCurrency amount={shareInfo.currentPrice * BigInt(shareInfo.totalShares)} />
              </p>
            </div>
          </div>
          
          {/* Graphique */}
          {priceHistory?.success && priceHistory.data && priceHistory.data.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-white/50 mb-3">Évolution du prix (7 jours)</p>
              <StockChart prices={priceHistory.data} height={200} showArea />
            </div>
          )}
          
          {/* Dernières transactions d'actions */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-white/50 mb-3">Dernières transactions d'actions</h3>
            {shareTransactions?.success && shareTransactions.data && shareTransactions.data.length > 0 ? (
              <div className="space-y-2">
                {shareTransactions.data.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${tx.seller ? 'bg-violet-400' : 'bg-green-400'}`} />
                      <div>
                        <p className="text-sm text-white">{tx.quantity} actions</p>
                        <p className="text-xs text-white/40">
                          {tx.seller ? `De ${tx.seller} à ${tx.buyer}` : `IPO - ${tx.buyer}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white"><OrbeCurrency amount={tx.pricePerShare} />/action</p>
                      <p className="text-xs text-white/40">Total: <OrbeCurrency amount={tx.totalAmount} /></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">Aucune transaction d'actions récente</p>
            )}
          </div>
          
          {/* Bouton acheter */}
          {user && !isOwner && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <BuySharesButton 
                company={{
                  id: company.id,
                  name: company.name,
                  objective: company.objective,
                  owner: company.owner,
                  shareInfo,
                  priceHistory: priceHistory?.data || [],
                }}
                userId={user.id}
              />
            </div>
          )}
        </GlassCard>
      )}
      
      {/* Compte bancaire */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            Compte bancaire
          </h2>
          <span className="text-xs text-white/40 font-mono">
            {company.capitalAccount.accountNumber}
          </span>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-white/50 mb-1">Solde</p>
          <OrbeCurrency amount={company.capitalAccount.balance} size="lg" />
        </div>
        
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-white/50 mb-3">Dernières transactions</h3>
          {transactions.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Aucune transaction"
              description="Les mouvements du compte apparaîtront ici"
            />
          ) : (
            <div className="space-y-2">
              {transactions.map(tx => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  accountId={company.capitalAccount.id}
                />
              ))}
            </div>
          )}
        </div>
      </GlassCard>
      
      {/* À propos */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-white mb-4">À propos</h2>
        <p className="text-white/70 whitespace-pre-wrap leading-relaxed">
          {company.description || 'Aucune description fournie.'}
        </p>
      </GlassCard>
      
      {/* Propriétaire */}
      <GlassCard>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-400" />
          Fondateur
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
            <span className="text-violet-400 text-lg font-bold">
              {(company.owner.displayName || company.owner.username).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">
              {company.owner.displayName || company.owner.username}
            </p>
            <Link 
              href={`/profile/${company.owner.username}`}
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              Voir le profil →
            </Link>
          </div>
        </div>
      </GlassCard>
      
      {/* Section Équipe et Emplois */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-violet-400" />
            Équipe et Recrutement
          </h2>
          {isOwner && (
            <Button variant="secondary" size="sm">
              Publier une offre
            </Button>
          )}
        </div>
        
        {/* Employés actifs */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/50 mb-3">Employés ({employees.length})</h3>
          {employees.length === 0 ? (
            <p className="text-sm text-white/40">Aucun employé pour le moment</p>
          ) : (
            <div className="space-y-2">
              {employees.map(emp => (
                <EmployeeRow 
                  key={emp.id} 
                  employment={emp} 
                  isOwner={isOwner}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Offres d'emploi */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-white/50 mb-3">Offres d'emploi</h3>
          {jobPostings.length === 0 ? (
            <p className="text-sm text-white/40">Aucune offre publiée</p>
          ) : (
            <div className="space-y-3">
              {jobPostings.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  isOwner={isOwner}
                />
              ))}
            </div>
          )}
        </div>
      </GlassCard>
      
      {/* Section Production */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Factory className="w-5 h-5 text-violet-400" />
            Production
          </h2>
          {isOwner && (
            <Button variant="secondary" size="sm">
              Ajouter une ligne
            </Button>
          )}
        </div>
        
        {productionLines.length === 0 ? (
          <p className="text-sm text-white/40">Aucune ligne de production active</p>
        ) : (
          <div className="space-y-4">
            {productionLines.map(line => {
              const progress = line.nextCycleAt 
                ? Math.max(0, 100 - Math.floor((new Date(line.nextCycleAt).getTime() - Date.now()) / (line.cycleHours * 60 * 60 * 1000) * 100))
                : 0
              
              return (
                <div key={line.id} className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-white">{line.outputResource.name}</p>
                      <p className="text-sm text-white/50">
                        {line.outputQuantityPerCycle} {line.outputResource.unit} / {line.cycleHours}h
                      </p>
                    </div>
                    <Badge variant={line.active ? 'success' : 'neutral'}>
                      {line.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/40">Coût: <OrbeCurrency amount={line.costPerCycle} />/cycle</span>
                    {line.nextCycleAt && (
                      <span className="text-white/40">
                        Prochain: {Math.max(0, Math.ceil((new Date(line.nextCycleAt).getTime() - Date.now()) / (1000 * 60 * 60)))}h
                      </span>
                    )}
                  </div>
                  
                  {line.active && line.nextCycleAt && (
                    <ProgressBar current={progress} max={100} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>
      
      {/* Section Inventaire */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-violet-400" />
            Inventaire
          </h2>
          <span className="text-sm text-white/50">{inventory.length} ressources</span>
        </div>
        
        {inventory.length === 0 ? (
          <p className="text-sm text-white/40">Inventaire vide</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {inventory.map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-white/5 text-center">
                <p className="font-medium text-white">{item.resourceType.name}</p>
                <p className="text-lg font-bold text-violet-400">{item.quantity}</p>
                <p className="text-xs text-white/40">{item.resourceType.unit}</p>
                <p className="text-xs text-white/50 mt-1">
                  Val: <OrbeCurrency amount={item.totalValue} />
                </p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
      
      {/* Section Contrats */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            Contrats
          </h2>
          {isOwner && (
            <Button variant="secondary" size="sm">
              Nouveau contrat
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Contrats fournisseur */}
          {providerContracts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/50 mb-2">Fournisseur ({providerContracts.length})</h3>
              <div className="space-y-2">
                {providerContracts.map(contract => (
                  <div key={contract.id} className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">
                        {contract.quantityPerDelivery} {contract.resourceType.unit} → {contract.client.name}
                      </p>
                      <p className="text-xs text-white/40">
                        <OrbeCurrency amount={contract.pricePerUnit} />/unité • Tous les {contract.frequencyHours}h
                      </p>
                    </div>
                    <Badge variant={contract.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {contract.status === 'ACTIVE' ? 'Actif' : 'En pause'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Contrats client */}
          {clientContracts.length > 0 && (
            <div className={providerContracts.length > 0 ? 'mt-4 pt-4 border-t border-white/10' : ''}>
              <h3 className="text-sm font-medium text-white/50 mb-2">Client ({clientContracts.length})</h3>
              <div className="space-y-2">
                {clientContracts.map(contract => (
                  <div key={contract.id} className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">
                        {contract.quantityPerDelivery} {contract.resourceType.unit} ← {contract.provider.name}
                      </p>
                      <p className="text-xs text-white/40">
                        <OrbeCurrency amount={contract.pricePerUnit} />/unité • Tous les {contract.frequencyHours}h
                      </p>
                    </div>
                    <Badge variant={contract.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {contract.status === 'ACTIVE' ? 'Actif' : 'En pause'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {providerContracts.length === 0 && clientContracts.length === 0 && (
            <p className="text-sm text-white/40">Aucun contrat actif</p>
          )}
        </div>
      </GlassCard>
      
      {/* Fonctionnalités à venir */}
      <GlassCard className="border-dashed border-white/20 bg-transparent">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white/30" />
          </div>
          <h2 className="text-lg font-semibold text-white/60 mb-2">Fonctionnalités à venir</h2>
          <p className="text-white/40 max-w-md mx-auto">
            Employés, stock, production... bientôt disponibles via les suggestions ◎
          </p>
          <Link href="/suggestions" className="inline-block mt-4">
            <Button variant="secondary" size="sm">
              Proposer une idée
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
