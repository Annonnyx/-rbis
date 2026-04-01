import { getCurrentUser } from '@/app/actions/auth'
import { getUserAccounts } from '@/app/actions/bank'
import { getUserCompanies } from '@/app/actions/company'
import { getRecentSuggestions } from '@/app/actions/suggestions'
import { getUserStats } from '@/app/actions/user'
import { GlassCard } from '@/components/GlassCard'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { StatBadge } from '@/components/StatBadge'
import { TransactionRow } from '@/components/TransactionRow'
import { Building2, Lightbulb, Users } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const [{ accounts }, { companies }, { suggestions }, stats] = await Promise.all([
    getUserAccounts(user.id),
    getUserCompanies(user.id),
    getRecentSuggestions(3),
    getUserStats(user.id),
  ])

  const personalAccount = accounts?.find(a => a.ownerType === 'PERSONAL')
  const recentTransactions = personalAccount?.sentTransactions || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50">Bienvenue, {user.displayName || user.username}</p>
      </div>

      {/* Total Balance */}
      <GlassCard padding="lg" className="text-center">
        <p className="text-white/50 mb-2">Solde total</p>
        <OrbeCurrency 
          amount={stats.totalBalance || 0n} 
          className="text-5xl font-bold text-white"
        />
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBadge 
          label="Entreprises" 
          value={stats.companiesCount || 0} 
        />
        <StatBadge 
          label="Suggestions" 
          value={stats.suggestionsCount || 0} 
        />
        <StatBadge 
          label="Comptes" 
          value={accounts?.length || 0} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Companies */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Building2 size={20} className="text-violet-400" />
              Mes entreprises
            </h2>
            <Link 
              href="/company/new" 
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              + Nouvelle
            </Link>
          </div>
          
          {companies && companies.length > 0 ? (
            <div className="space-y-3">
              {companies.map((company) => (
                <Link 
                  key={company.id} 
                  href={`/company/${company.id}`}
                  className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                >
                  <h3 className="font-semibold text-white">{company.name}</h3>
                  <p className="text-sm text-white/50 line-clamp-1">{company.objective}</p>
                  <OrbeCurrency 
                    amount={company.capitalAccount?.balance || 0n} 
                    className="text-sm text-violet-300 mt-2"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-center py-4">
              Aucune entreprise.{' '}
              <Link href="/company/new" className="text-violet-400">
                Créer la première
              </Link>
            </p>
          )}
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Dernières transactions</h2>
            <Link 
              href="/bank" 
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              Voir tout
            </Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <TransactionRow 
                  key={tx.id} 
                  transaction={tx} 
                  accountId={personalAccount?.id || ''}
                />
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-center py-4">
              Aucune transaction récente
            </p>
          )}
        </GlassCard>
      </div>

      {/* Recent Suggestions */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-400" />
            Suggestions récentes
          </h2>
          <Link 
            href="/suggestions" 
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            Voir tout
          </Link>
        </div>
        
        {suggestions && suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <h3 className="font-semibold text-white line-clamp-1">{suggestion.title}</h3>
                <p className="text-sm text-white/50 line-clamp-2">{suggestion.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                  <span>{suggestion.upvotes} votes</span>
                  <span>•</span>
                  <span>{suggestion.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-center py-4">
            Aucune suggestion pour le moment
          </p>
        )}
      </GlassCard>
    </div>
  )
}
