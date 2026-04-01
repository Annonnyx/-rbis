import { clsx } from 'clsx'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { OrbeCurrency } from './OrbeCurrency'

interface TransactionRowProps {
  transaction: {
    id: string
    amount: bigint
    label?: string | null
    createdAt: Date
    fromAccountId: string
    toAccountId: string
    fromAccount: {
      accountNumber: string
      company?: { name: string } | null
    }
    toAccount: {
      accountNumber: string
      company?: { name: string } | null
    }
  }
  accountId: string
  showAccountInfo?: boolean
}

export function TransactionRow({ transaction, accountId, showAccountInfo = false }: TransactionRowProps) {
  const isOutgoing = transaction.fromAccountId === accountId
  const otherAccount = isOutgoing ? transaction.toAccount : transaction.fromAccount

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center',
            isOutgoing ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          )}
        >
          {isOutgoing ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {transaction.label || (isOutgoing ? 'Transfert envoyé' : 'Transfert reçu')}
          </p>
          {showAccountInfo && (
            <p className="text-xs text-white/50">
              {isOutgoing ? 'Vers' : 'De'}: {otherAccount.company?.name || otherAccount.accountNumber}
            </p>
          )}
          <p className="text-xs text-white/40">
            {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <OrbeCurrency
        amount={transaction.amount}
        className={clsx(
          'font-semibold',
          isOutgoing ? 'text-red-400' : 'text-green-400'
        )}
      />
    </div>
  )
}
