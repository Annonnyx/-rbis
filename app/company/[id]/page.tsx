import { notFound } from 'next/navigation'
import { getCompanyById } from '@/app/actions/company'
import { getCurrentUser } from '@/app/actions/auth'
import { GlassCard } from '@/components/GlassCard'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { TransactionRow } from '@/components/TransactionRow'
import { Building2, MapPin, User } from 'lucide-react'
import Link from 'next/link'

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  const result = await getCompanyById(id, user.id)
  
  if (result.error || !result.company) {
    notFound()
  }

  const { company, transactions } = result

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{company.name}</h1>
        <Link
          href="/company/new"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-all duration-200"
        >
          + Nouvelle entreprise
        </Link>
      </div>

      {/* Company Info */}
      <GlassCard>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Building2 size={32} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{company.name}</h2>
            <p className="text-cyan-400">{company.objective}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {company.location?.name}
              </span>
              <span className="flex items-center gap-1">
                <User size={14} />
                {company.owner?.displayName || company.owner?.username}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-white/50 mb-1">Solde du compte</p>
            <OrbeCurrency 
              amount={company.capitalAccount?.balance || 0n} 
              className="text-2xl font-bold text-white"
            />
            <p className="text-xs text-white/30 mt-1">
              {company.capitalAccount?.accountNumber}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-white/50 mb-1">Description</p>
            <p className="text-sm text-white/70 line-clamp-3">{company.description}</p>
          </div>
        </div>
      </GlassCard>

      {/* Transactions */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-4">Transactions</h2>
        
        {transactions && transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx: any) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                accountId={company.capitalAccountId}
                showAccountInfo
              />
            ))}
          </div>
        ) : (
          <p className="text-white/50 text-center py-8">
            Aucune transaction pour cette entreprise
          </p>
        )}
      </GlassCard>
    </div>
  )
}
