// ============================================
// components/TransactionRow.tsx
// Ligne de transaction avec montant, label et comptes
// @example <TransactionRow tx={transaction} accountId={myAccountId} />
// ============================================

import { cn } from '@/lib/utils'
import { OrbeCurrency } from './OrbeCurrency'
import { ArrowRight, ArrowLeftRight } from 'lucide-react'
import type { Transaction, BankAccount } from '@/types'

export interface TransactionRowProps {
  tx: Transaction & {
    fromAccount?: Pick<BankAccount, 'accountNumber' | 'ownerType'>
    toAccount?: Pick<BankAccount, 'accountNumber' | 'ownerType'>
  }
  accountId: string
  className?: string
}

/**
 * Affiche une ligne de transaction
 * Montre le montant (+ ou - selon le compte de référence), label, date
 */
export function TransactionRow({ tx, accountId, className }: TransactionRowProps) {
  const isOutgoing = tx.fromAccountId === accountId
  const isInternal = tx.fromAccountId === tx.toAccountId
  
  const date = new Date(tx.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
  
  return (
    <div className={cn(
      'flex items-center justify-between py-3 px-4 rounded-xl',
      'bg-white/[0.02] hover:bg-white/[0.05] transition-colors',
      className
    )}>
      <div className="flex items-center gap-3">
        {/* Direction indicator */}
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          isInternal ? 'bg-white/5' : isOutgoing ? 'bg-red-500/10' : 'bg-green-500/10'
        )}>
          {isInternal ? (
            <ArrowLeftRight className="w-4 h-4 text-white/40" />
          ) : isOutgoing ? (
            <ArrowRight className="w-4 h-4 text-red-400 rotate-45" />
          ) : (
            <ArrowRight className="w-4 h-4 text-green-400 -rotate-45" />
          )}
        </div>
        
        {/* Details */}
        <div>
          <p className="text-sm font-medium text-white">
            {tx.label || (isInternal ? 'Virement interne' : isOutgoing ? 'Envoi' : 'Réception')}
          </p>
          <p className="text-xs text-white/40">
            {isInternal ? 'Compte personnel' : 
             isOutgoing ? `Vers ${tx.toAccount?.accountNumber?.slice(-8) || '...'}` : 
             `De ${tx.fromAccount?.accountNumber?.slice(-8) || '...'}`}
          </p>
        </div>
      </div>
      
      {/* Amount & Date */}
      <div className="text-right">
        <p className={cn(
          'text-sm font-medium tabular-nums',
          isInternal ? 'text-white/60' : isOutgoing ? 'text-red-400' : 'text-green-400'
        )}>
          {isOutgoing ? '-' : '+'}
          <OrbeCurrency amount={tx.amount} size="sm" />
        </p>
        <p className="text-xs text-white/30">{date}</p>
      </div>
    </div>
  )
}
