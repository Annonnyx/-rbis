// ============================================
// app/dashboard/page.tsx
// Dashboard utilisateur complet
// ============================================

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { getUserAccounts } from '@/app/actions/bank'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { StatBadge } from '@/components/StatBadge'
import { TransactionRow } from '@/components/TransactionRow'
import { SuggestionCard } from '@/components/SuggestionCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { DashboardUserCounter } from '@/components/DashboardUserCounter'
import { Building2, Wallet, ArrowRight, Lightbulb } from 'lucide-react'
import { prisma } from '@/lib/prisma'

// ============================================
// Section : Mes entreprises
// ============================================

async function CompaniesSection({ userId }: { userId: string }) {
  const companies = await prisma.company.findMany({
    where: { ownerId: userId },
    include: { capitalAccount: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  
  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Aucune entreprise"
        description="Créez votre première entreprise pour rejoindre l'économie de Ørbis"
        action={
          <Link href="/company/new">
            <Button>Créer une entreprise</Button>
          </Link>
        }
      />
    )
  }
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
      {companies.map(company => (
        <Link
          key={company.id}
          href={`/company/${company.id}`}
          className="flex-shrink-0 w-64"
        >
          <GlassCard hover className="h-full">
            <h3 className="font-semibold text-white truncate">{company.name}</h3>
            <p className="text-sm text-white/50 line-clamp-1 mt-1">{company.objective}</p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">Capital</p>
              <OrbeCurrency amount={company.capitalAccount.balance} />
            </div>
          </GlassCard>
        </Link>
      ))}
    </div>
  )
}

// ============================================
// Section : Dernières transactions
// ============================================

async function TransactionsSection({ userId }: { userId: string }) {
  const result = await getUserAccounts(userId).then(r => 
    r.success ? r : { accounts: [] }
  )
  const accounts = result.accounts || []
  
  // Récupérer toutes les transactions des comptes de l'utilisateur
  const accountIds = accounts.map(a => a.id)
  
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromAccountId: { in: accountIds } },
        { toAccountId: { in: accountIds } },
      ],
    },
    include: {
      fromAccount: { select: { accountNumber: true, ownerType: true } },
      toAccount: { select: { accountNumber: true, ownerType: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Aucune transaction"
        description="Vos mouvements bancaires apparaîtront ici"
      />
    )
  }
  
  return (
    <div className="space-y-2">
      {transactions.map(tx => (
        <TransactionRow
          key={tx.id}
          tx={tx}
          accountId={tx.fromAccountId}
        />
      ))}
      <Link href="/bank">
        <Button variant="ghost" size="sm" className="w-full mt-2">
          Voir tout <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  )
}

// ============================================
// Section : Suggestions récentes
// ============================================

async function SuggestionsSection() {
  const suggestions = await prisma.suggestion.findMany({
    where: { status: 'PENDING' },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
  
  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="Aucune suggestion"
        description="Soyez le premier à proposer une idée !"
      />
    )
  }
  
  return (
    <div className="space-y-3">
      {suggestions.map(s => (
        <SuggestionCard
          key={s.id}
          suggestion={s}
          hasVoted={false}
        />
      ))}
      <Link href="/suggestions">
        <Button variant="ghost" size="sm" className="w-full">
          Voir tout <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  )
}

// ============================================
// Main Page
// ============================================

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Calcul du solde total
  const result = await getUserAccounts(user.id).then(r => 
    r.success ? r : { accounts: [] }
  )
  const accounts = result.accounts || []
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0n)
  
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header personnalisé */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Bonjour, {user.displayName || user.username} ◎
          </h1>
          <p className="text-white/50 mt-1">Voici votre résumé du jour</p>
        </div>
        <GlassCard padding="sm" className="text-center md:text-left">
          <p className="text-sm text-white/50">Solde total</p>
          <OrbeCurrency amount={totalBalance} size="lg" />
        </GlassCard>
      </div>
      
      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBadge
          label="Entreprises"
          value={user.companies?.length || 0}
          icon={Building2}
        />
        <StatBadge
          label="Comptes"
          value={accounts.length}
          icon={Wallet}
        />
        <StatBadge
          label="Joueurs actifs"
          value={<DashboardUserCounter />}
          trend="up"
        />
        <StatBadge
          label="Résidence"
          value={user.gameProfile?.homeLocation?.name || '-'}
        />
      </div>
      
      {/* Grid principal */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-400" />
              Mes entreprises
            </h2>
            <Suspense fallback={<LoadingSkeleton variant="card" count={2} />}>
              <CompaniesSection userId={user.id} />
            </Suspense>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-violet-400" />
              Dernières transactions
            </h2>
            <Suspense fallback={<LoadingSkeleton variant="row" count={3} />}>
              <TransactionsSection userId={user.id} />
            </Suspense>
          </section>
        </div>
        
        {/* Colonne droite */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-violet-400" />
              Suggestions en attente
            </h2>
            <Suspense fallback={<LoadingSkeleton variant="card" count={3} />}>
              <SuggestionsSection />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  )
}
