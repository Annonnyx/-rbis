"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  Landmark, ArrowUpRight, ArrowDownRight, Plus, Wallet, 
  Send, History, CreditCard, PiggyBank, TrendingUp,
  ChevronRight, Copy, CheckCircle2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"

interface BankAccount {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  isMain: boolean
  accountNumber: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  fromAccountId?: string
  toAccountId?: string
  fromAccount?: { name: string }
  toAccount?: { name: string }
  createdAt: string
}

const isBrowser = typeof window !== "undefined"

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
  const [activeTab, setActiveTab] = useState<"accounts" | "transfer" | "history">("accounts")
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  
  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "CHECKING",
  })
  
  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    toAccountNumber: "",
    amount: "",
    description: "",
  })
  
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)

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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/bank/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      })
      if (res.ok) {
        fetchBankData()
        setShowCreateAccount(false)
        setAccountForm({ name: "", type: "CHECKING" })
      }
    } catch (error) {
      console.error("Error creating account:", error)
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/bank/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRANSFER",
          fromAccountId: transferForm.fromAccountId,
          toAccountId: transferForm.toAccountId || undefined,
          toAccountNumber: transferForm.toAccountNumber || undefined,
          amount: parseFloat(transferForm.amount),
          description: transferForm.description,
        }),
      })
      if (res.ok) {
        fetchBankData()
        setShowTransfer(false)
        setTransferForm({
          fromAccountId: "",
          toAccountId: "",
          toAccountNumber: "",
          amount: "",
          description: "",
        })
        setActiveTab("history")
      }
    } catch (error) {
      console.error("Error making transfer:", error)
    }
  }

  const copyAccountNumber = (number: string) => {
    navigator.clipboard.writeText(number)
    setCopiedAccount(number)
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  const totalBalance = accounts.reduce((acc, account) => acc + Number(account.balance), 0)
  const mainAccount = accounts.find(a => a.isMain)

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT": return "Dépôt"
      case "WITHDRAWAL": return "Retrait"
      case "TRANSFER": return "Transfert"
      case "PAYMENT": return "Paiement"
      case "SALE": return "Vente"
      default: return type
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
      case "SALE":
        return <ArrowDownRight className="w-5 h-5 text-green-500" />
      case "WITHDRAWAL":
      case "PAYMENT":
        return <ArrowUpRight className="w-5 h-5 text-red-500" />
      case "TRANSFER":
        return <Send className="w-5 h-5 text-blue-500" />
      default:
        return <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Landmark className="w-16 h-16 text-primary/60 animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (showCreateAccount) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-2 gradient-text">Nouveau compte</h1>
        <p className="text-muted-foreground mb-6">Créez un compte bancaire supplémentaire</p>
        
        <form onSubmit={handleCreateAccount} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <GlassInput
              label="Nom du compte"
              required
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              placeholder="Ex: Épargne vacances"
            />
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Type de compte</label>
              <select
                value={accountForm.type}
                onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                className="w-full px-4 py-3 glass-input rounded-xl"
              >
                <option value="CHECKING">Compte courant</option>
                <option value="SAVINGS">Compte épargne</option>
                <option value="BUSINESS">Compte professionnel</option>
              </select>
            </div>
          </GlassCard>
          
          <div className="flex gap-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowCreateAccount(false)} className="flex-1">
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1">
              Créer le compte
            </GlassButton>
          </div>
        </form>
      </div>
    )
  }

  if (showTransfer) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-2 gradient-text">Effectuer un transfert</h1>
        <p className="text-muted-foreground mb-6">Transférez de l&apos;argent vers un autre compte</p>
        
        <form onSubmit={handleTransfer} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Depuis</label>
              <select
                value={transferForm.fromAccountId}
                onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                required
                className="w-full px-4 py-3 glass-input rounded-xl"
              >
                <option value="">Sélectionnez un compte</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(Number(account.balance))}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">Vers (compte interne)</label>
                <select
                  value={transferForm.toAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value, toAccountNumber: "" })}
                  className="w-full px-4 py-3 glass-input rounded-xl"
                >
                  <option value="">Sélectionnez</option>
                  {accounts.filter(a => a.id !== transferForm.fromAccountId).map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">Ou numéro externe</label>
                <GlassInput
                  placeholder="XXXX-XXXX"
                  value={transferForm.toAccountNumber}
                  onChange={(e) => setTransferForm({ ...transferForm, toAccountNumber: e.target.value, toAccountId: "" })}
                />
              </div>
            </div>
            
            <GlassInput
              label="Montant (\u00D8)"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              placeholder="100"
            />
            
            <GlassInput
              label="Description (optionnel)"
              value={transferForm.description}
              onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
              placeholder="Ex: Paiement facture #123"
            />
          </GlassCard>
          
          <div className="flex gap-4">
            <GlassButton type="button" variant="ghost" onClick={() => setShowTransfer(false)} className="flex-1">
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="primary" className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Confirmer le transfert
            </GlassButton>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Ma Banque</h1>
          <p className="text-muted-foreground">Gérez vos comptes et transactions</p>
        </div>
        <GlassButton onClick={() => setShowTransfer(true)} variant="primary">
          <Send className="w-4 h-4 mr-2" />
          Transférer
        </GlassButton>
      </div>

      {/* Total Balance Card */}
      <GlassCard liquid className="p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative">
          <p className="text-muted-foreground mb-2">Solde total</p>
          <p className="text-5xl font-bold gradient-text mb-2">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-muted-foreground">{accounts.length} compte(s)</p>
        </div>
      </GlassCard>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "accounts", label: "Mes comptes", icon: Wallet },
          { id: "transfer", label: "Transfert rapide", icon: Send },
          { id: "history", label: "Historique", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "transfer") {
                setShowTransfer(true)
              } else {
                setActiveTab(tab.id as any)
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id && tab.id !== "transfer"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "glass-button"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mes comptes</h2>
            <GlassButton onClick={() => setShowCreateAccount(true)} variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau compte
            </GlassButton>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <GlassCard 
                key={account.id} 
                liquid={account.isMain}
                className={`p-6 ${account.isMain ? "ring-2 ring-primary/20" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${account.isMain ? "bg-primary/10" : "bg-accent"}`}>
                      {account.type === "SAVINGS" ? (
                        <PiggyBank className={`w-5 h-5 ${account.isMain ? "text-primary" : ""}`} />
                      ) : account.type === "BUSINESS" ? (
                        <Landmark className={`w-5 h-5 ${account.isMain ? "text-primary" : ""}`} />
                      ) : (
                        <Wallet className={`w-5 h-5 ${account.isMain ? "text-primary" : ""}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{account.type}</p>
                    </div>
                  </div>
                  {account.isMain && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      Principal
                    </span>
                  )}
                </div>
                
                <p className="text-3xl font-bold mb-3">{formatCurrency(Number(account.balance))}</p>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono text-muted-foreground">{account.accountNumber}</span>
                  <button
                    onClick={() => copyAccountNumber(account.accountNumber)}
                    className="ml-auto p-1 hover:bg-accent rounded transition-colors"
                  >
                    {copiedAccount === account.accountNumber ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </GlassCard>
            ))}
            
            <button
              onClick={() => setShowCreateAccount(true)}
              className="glass-card border-dashed border-2 border-muted hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 min-h-[180px] rounded-2xl"
            >
              <Plus className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">Créer un nouveau compte</p>
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Transactions récentes</h2>
          
          {transactions.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune transaction pour le moment</p>
              <GlassButton onClick={() => setShowTransfer(true)} variant="secondary" className="mt-4">
                Effectuer un transfert
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 20).map((transaction) => (
                <GlassCard key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === "DEPOSIT" || transaction.type === "SALE"
                          ? "bg-green-500/10"
                          : transaction.type === "TRANSFER"
                          ? "bg-blue-500/10"
                          : "bg-red-500/10"
                      }`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || getTransactionTypeLabel(transaction.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === "DEPOSIT" || transaction.type === "SALE" || transaction.type === "TRANSFER"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                      {transaction.type === "DEPOSIT" || transaction.type === "SALE" ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
