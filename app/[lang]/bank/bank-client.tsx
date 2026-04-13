"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Landmark, ArrowUpRight, ArrowDownRight, Plus, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BankAccount {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  isMain: boolean
  createdAt: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
}

// Check if we're in the browser
const isBrowser = typeof window !== "undefined"

// Safe hook that handles prerendering
function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

export function BankClient() {
  const { data: session, status } = useSafeSession()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchBankData()
    }
  }, [status])

  const fetchBankData = async () => {
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        fetch("/api/bank/accounts"),
        fetch("/api/bank/transactions"),
      ])
      
      if (accountsRes.ok) {
        setAccounts(await accountsRes.json())
      }
      if (transactionsRes.ok) {
        setTransactions(await transactionsRes.json())
      }
    } catch (error) {
      console.error("Error fetching bank data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Landmark className="w-12 h-12 text-orbe animate-pulse" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const totalBalance = accounts.reduce((acc, account) => acc + Number(account.balance), 0)

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT": return "Dépôt"
      case "WITHDRAWAL": return "Retrait"
      case "TRANSFER": return "Transfert"
      case "PAYMENT": return "Paiement"
      default: return type
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ma Banque</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-orbe text-white rounded-lg hover:bg-orbe-dark transition-colors">
          <ArrowUpRight className="w-4 h-4" />
          Transférer
        </button>
      </div>

      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-muted-foreground mb-2">Solde total</p>
        <p className="text-5xl font-bold text-orbe">{formatCurrency(totalBalance)}</p>
        <p className="text-sm text-muted-foreground mt-2">{accounts.length} compte(s)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className={`glass rounded-2xl p-6 ${account.isMain ? "ring-2 ring-orbe" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orbe/10 rounded-lg">
                  <Wallet className="w-5 h-5 text-orbe" />
                </div>
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{account.type}</p>
                </div>
              </div>
              {account.isMain && <span className="px-2 py-1 bg-orbe/10 text-orbe text-xs rounded-full">Principal</span>}
            </div>
            <p className="text-3xl font-bold">{formatCurrency(Number(account.balance))}</p>
          </div>
        ))}
        <button className="glass rounded-2xl p-6 border-dashed border-2 border-muted hover:border-orbe transition-colors flex flex-col items-center justify-center gap-3 min-h-[160px]">
          <Plus className="w-8 h-8 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">Créer un nouveau compte</p>
        </button>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Transactions récentes</h2>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucune transaction pour le moment</p>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${transaction.type === "DEPOSIT" || transaction.type === "TRANSFER" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    {transaction.type === "DEPOSIT" || transaction.type === "TRANSFER" ? (
                      <ArrowDownRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description || getTransactionTypeLabel(transaction.type)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-semibold ${transaction.type === "DEPOSIT" || transaction.type === "TRANSFER" ? "text-green-500" : "text-red-500"}`}>
                  {transaction.type === "DEPOSIT" || transaction.type === "TRANSFER" ? "+" : "-"}
                  {formatCurrency(Number(transaction.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
