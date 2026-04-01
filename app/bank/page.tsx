'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/app/actions/auth'
import { getUserAccounts, getAccountTransactions, transferFunds } from '@/app/actions/bank'
import { GlassCard } from '@/components/GlassCard'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { TransactionRow } from '@/components/TransactionRow'
import { ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react'

interface Account {
  id: string
  ownerType: 'PERSONAL' | 'COMPANY'
  companyId?: string | null
  balance: bigint
  accountNumber: string
  company?: { name: string } | null
  sentTransactions: Array<{
    id: string
    amount: bigint
    label?: string | null
    createdAt: Date
    toAccount: {
      accountNumber: string
      company?: { name: string } | null
    }
  }>
  receivedTransactions: Array<{
    id: string
    amount: bigint
    label?: string | null
    createdAt: Date
    fromAccount: {
      accountNumber: string
      company?: { name: string } | null
    }
  }>
}

export default function BankPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferData, setTransferData] = useState({
    toAccountNumber: '',
    amount: '',
    label: '',
  })
  const [transferError, setTransferError] = useState('')
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    async function loadAccounts() {
      const user = await getCurrentUser()
      if (user) {
        const result = await getUserAccounts(user.id)
        if (result.accounts) {
          setAccounts(result.accounts as Account[])
          if (result.accounts.length > 0) {
            setSelectedAccount(result.accounts[0] as Account)
          }
        }
      }
      setLoading(false)
    }

    loadAccounts()
  }, [])

  useEffect(() => {
    async function loadTransactions() {
      if (!selectedAccount) return
      
      const result = await getAccountTransactions(selectedAccount.id, page)
      if (result.transactions) {
        setTransactions(result.transactions)
      }
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages)
      }
    }

    loadTransactions()
  }, [selectedAccount, page])

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAccount) return

    setTransferring(true)
    setTransferError('')

    const amountInCentimes = Math.round(parseFloat(transferData.amount) * 100)
    
    const result = await transferFunds(
      selectedAccount.id,
      transferData.toAccountNumber,
      BigInt(amountInCentimes),
      transferData.label || null,
      '' // userId will be handled server-side
    )

    if (result.error) {
      setTransferError(result.error)
      setTransferring(false)
      return
    }

    // Refresh accounts and transactions
    const user = await getCurrentUser()
    if (user) {
      const accountsResult = await getUserAccounts(user.id)
      if (accountsResult.accounts) {
        setAccounts(accountsResult.accounts as Account[])
        const updated = accountsResult.accounts.find((a: Account) => a.id === selectedAccount.id)
        if (updated) setSelectedAccount(updated as Account)
      }
    }

    setShowTransferModal(false)
    setTransferData({ toAccountNumber: '', amount: '', label: '' })
    setTransferring(false)
    setPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/50">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Ma Banque</h1>
        <button
          onClick={() => setShowTransferModal(true)}
          disabled={!selectedAccount}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold transition-all duration-200"
        >
          <ArrowRightLeft size={18} />
          Virer des fonds
        </button>
      </div>

      {/* Accounts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => {
              setSelectedAccount(account)
              setPage(1)
            }}
            className={`text-left p-6 rounded-2xl border transition-all duration-200 ${
              selectedAccount?.id === account.id
                ? 'bg-violet-500/10 border-violet-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">
                {account.ownerType === 'PERSONAL' ? 'Compte personnel' : 'Entreprise'}
              </span>
              {account.company && (
                <span className="text-xs text-cyan-400">{account.company.name}</span>
              )}
            </div>
            <OrbeCurrency 
              amount={account.balance} 
              className="text-2xl font-bold text-white"
            />
            <p className="text-xs text-white/30 mt-2">{account.accountNumber}</p>
          </button>
        ))}
      </div>

      {/* Transactions */}
      {selectedAccount && (
        <GlassCard>
          <h2 className="text-xl font-semibold text-white mb-4">
            Historique des transactions
          </h2>
          
          {transactions.length > 0 ? (
            <>
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    accountId={selectedAccount.id}
                    showAccountInfo
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white/70 transition-all duration-200"
                  >
                    <ChevronLeft size={16} />
                    Précédent
                  </button>
                  <span className="text-white/50 text-sm">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white/70 transition-all duration-200"
                  >
                    Suivant
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-white/50 text-center py-8">
              Aucune transaction pour ce compte
            </p>
          )}
        </GlassCard>
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard padding="lg" className="w-full max-w-md">
            <h2 className="text-2xl font-semibold text-white mb-4">Effectuer un virement</h2>
            
            {transferError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {transferError}
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Depuis
                </label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
                  {selectedAccount.company?.name || 'Compte personnel'}
                  <span className="text-white/50 text-sm ml-2">
                    (<OrbeCurrency amount={selectedAccount.balance} showDecimals={false} />)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Numéro de compte destinataire
                </label>
                <input
                  type="text"
                  value={transferData.toAccountNumber}
                  onChange={(e) => setTransferData({ ...transferData, toAccountNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                  placeholder="ORB-XXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Montant (◎)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={Number(selectedAccount.balance) / 100}
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                  placeholder="100.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Libellé (optionnel)
                </label>
                <input
                  type="text"
                  value={transferData.label}
                  onChange={(e) => setTransferData({ ...transferData, label: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                  placeholder="Paiement..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="flex-1 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold transition-all duration-200"
                >
                  {transferring ? 'Transfert...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
