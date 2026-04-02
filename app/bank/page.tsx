// ============================================
// app/bank/page.tsx
// Page banque complète avec modal de virement
// ============================================

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { getUserAccounts } from '@/app/actions/bank'
import { PageHeader } from '@/components/PageHeader'
import { AccountCard } from '@/components/AccountCard'
import { TransferModal } from '@/components/TransferModal'
import { TransactionHistory } from '@/components/TransactionHistory'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { Wallet, ArrowRightLeft } from 'lucide-react'

export default async function BankPage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  const result = await getUserAccounts(user.id)
  const accounts = result.success ? (result.accounts ?? []) : []
  
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <PageHeader 
        title="Ma Banque" 
        description="Gérez vos comptes et effectuez des virements"
      />
      
      {/* Mes comptes */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-violet-400" />
          Mes comptes
        </h2>
        
        {accounts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Aucun compte"
            description="Contactez l'administration"
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {accounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </section>
      
      {/* Historique avec filtre */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-violet-400" />
          Historique des transactions
        </h2>
        
        <Suspense fallback={<LoadingSkeleton variant="row" count={5} />}>
          <TransactionHistory accounts={accounts} />
        </Suspense>
      </section>
      
      {/* Modal de virement (client component) */}
      <TransferModal accounts={accounts} />
    </div>
  )
}
