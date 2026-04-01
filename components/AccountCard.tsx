// ============================================
// components/AccountCard.tsx
// Card de compte bancaire avec solde et numéro
// @example <AccountCard account={account} />
// ============================================

import { cn } from '@/lib/utils'
import { OrbeCurrency } from './OrbeCurrency'
import { Badge } from './ui/Badge'
import { Wallet, Building2 } from 'lucide-react'
import type { BankAccount } from '@/types'
import { AccountOwnerType } from '@prisma/client'

export interface AccountCardProps {
  account: BankAccount & {
    owner?: { username: string }
  }
  className?: string
}

/**
 * Card affichant un compte bancaire
 * Montre le type (PERSONAL/COMPANY), le numéro masqué et le solde
 */
export function AccountCard({ account, className }: AccountCardProps) {
  const isPersonal = account.ownerType === AccountOwnerType.PERSONAL
  const maskedNumber = `****${account.accountNumber.slice(-4)}`
  
  return (
    <div className={cn(
      'backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5',
      'hover:bg-white/[0.08] transition-all duration-200',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            isPersonal ? 'bg-violet-500/20' : 'bg-fuchsia-500/20'
          )}>
            {isPersonal ? (
              <Wallet className="w-5 h-5 text-violet-400" />
            ) : (
              <Building2 className="w-5 h-5 text-fuchsia-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-white">
              {isPersonal ? 'Compte personnel' : 'Compte entreprise'}
            </p>
            <p className="text-xs text-white/40 font-mono">{maskedNumber}</p>
          </div>
        </div>
        <Badge variant={isPersonal ? 'violet' : 'neutral'}>
          {account.ownerType}
        </Badge>
      </div>
      
      {/* Balance */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-sm text-white/50 mb-1">Solde</p>
        <OrbeCurrency amount={account.balance} size="lg" />
      </div>
    </div>
  )
}
