// ============================================
// components/TransactionHistory.tsx
// Historique paginé des transactions
// ============================================

'use client'

import { useState } from 'react'
import { TransactionRow } from './TransactionRow'
import { Button } from './ui/Button'
import { LoadingSkeleton } from './LoadingSkeleton'
import { getTransactionHistory } from '@/app/actions/bank'
import type { BankAccount } from '@/types'

interface TransactionHistoryProps {
  accounts: BankAccount[]
}

export function TransactionHistory({ accounts }: TransactionHistoryProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '')
  const [page, setPage] = useState(1)
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Charger les transactions quand le compte ou la page change
  // Simplifié pour l'exemple - en production utiliser useEffect
  
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        Aucun compte disponible
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Filtre par compte */}
      <div className="flex gap-2 flex-wrap">
        {accounts.map(account => (
          <Button
            key={account.id}
            variant={selectedAccountId === account.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedAccountId(account.id)}
          >
            {account.ownerType === 'PERSONAL' ? 'Perso' : 'Entreprise'}
            {' '}
            (****{account.accountNumber.slice(-4)})
          </Button>
        ))}
      </div>
      
      {/* Liste des transactions */}
      <div className="space-y-2">
        {loading ? (
          <LoadingSkeleton variant="row" count={5} />
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            Aucune transaction pour ce compte
          </div>
        ) : (
          transactions.map(tx => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              accountId={selectedAccountId}
            />
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Précédent
          </Button>
          <span className="px-4 py-2 text-white/60">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
