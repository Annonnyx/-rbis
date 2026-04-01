// ============================================
// components/TransferModal.tsx
// Modal de virement bancaire
// ============================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { GlassCard } from './ui/GlassCard'
import { OrbeCurrency } from './OrbeCurrency'
import { transferFunds } from '@/app/actions/bank'
import { toOrbe } from '@/lib/currency'
import { ArrowRight, Check, AlertCircle } from 'lucide-react'
import type { BankAccount } from '@/types'

interface TransferModalProps {
  accounts: BankAccount[]
}

export function TransferModal({ accounts }: TransferModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'confirm' | 'success' | 'error'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fromAccountId: accounts[0]?.id || '',
    toAccountNumber: '',
    amount: '',
    label: '',
  })
  
  const fromAccount = accounts.find(a => a.id === formData.fromAccountId)
  const amountNum = parseFloat(formData.amount) || 0
  const maxAmount = fromAccount ? toOrbe(fromAccount.balance) : 0
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (amountNum <= 0) {
      setError('Le montant doit être supérieur à 0')
      return
    }
    
    if (amountNum > maxAmount) {
      setError('Solde insuffisant')
      return
    }
    
    if (!formData.toAccountNumber.trim()) {
      setError('Veuillez entrer un numéro de compte destinataire')
      return
    }
    
    setStep('confirm')
    setError('')
  }
  
  async function handleConfirm() {
    setLoading(true)
    
    const result = await transferFunds({
      fromAccountId: formData.fromAccountId,
      toAccountNumber: formData.toAccountNumber.trim(),
      amount: amountNum,
      label: formData.label || undefined,
    })
    
    if (result.success) {
      setStep('success')
    } else {
      setError(result.error || 'Erreur lors du virement')
      setStep('error')
    }
    
    setLoading(false)
  }
  
  function handleClose() {
    setIsOpen(false)
    setStep('form')
    setError('')
    setFormData({
      fromAccountId: accounts[0]?.id || '',
      toAccountNumber: '',
      amount: '',
      label: '',
    })
    if (step === 'success') {
      router.refresh()
    }
  }
  
  return (
    <>
      {/* Bouton d'ouverture */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-40"
      >
        <div className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-4 shadow-lg shadow-violet-600/30 transition-all hover:scale-105">
          <ArrowRight className="w-6 h-6" />
        </div>
      </button>
      
      <Modal isOpen={isOpen} onClose={handleClose} title="Effectuer un virement">
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            {/* Sélecteur de compte source */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Depuis
              </label>
              <select
                value={formData.fromAccountId}
                onChange={e => setFormData(d => ({ ...d, fromAccountId: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 focus:outline-none"
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id} className="bg-[#0a0a0f]">
                    {account.ownerType === 'PERSONAL' ? 'Compte personnel' : 'Entreprise'} 
                    {' — '}
                    <OrbeCurrency amount={account.balance} />
                  </option>
                ))}
              </select>
            </div>
            
            {/* Compte destinataire */}
            <Input
              label="Numéro de compte destinataire"
              placeholder="ORB-XXXX-XXXX"
              value={formData.toAccountNumber}
              onChange={e => setFormData(d => ({ ...d, toAccountNumber: e.target.value }))}
              required
            />
            
            {/* Montant */}
            <div>
              <Input
                label="Montant"
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                placeholder="1000.00"
                value={formData.amount}
                onChange={e => setFormData(d => ({ ...d, amount: e.target.value }))}
                required
              />
              <p className="text-xs text-white/40 mt-1">
                Solde disponible : <OrbeCurrency amount={fromAccount?.balance || 0n} />
              </p>
            </div>
            
            {/* Label */}
            <Input
              label="Motif (optionnel)"
              placeholder="Paiement pour..."
              value={formData.label}
              onChange={e => setFormData(d => ({ ...d, label: e.target.value }))}
            />
            
            <Button type="submit" className="w-full mt-4">
              Continuer
            </Button>
          </form>
        )}
        
        {step === 'confirm' && (
          <div className="space-y-4">
            <GlassCard className="text-center">
              <p className="text-white/60 text-sm mb-2">Montant à transférer</p>
              <p className="text-3xl font-bold text-white">
                <OrbeCurrency amount={BigInt(Math.round(amountNum * 100))} />
              </p>
            </GlassCard>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/50">Depuis</span>
                <span className="text-white">
                  {fromAccount?.ownerType === 'PERSONAL' ? 'Compte personnel' : 'Entreprise'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/50">Vers</span>
                <span className="text-white font-mono">{formData.toAccountNumber}</span>
              </div>
              {formData.label && (
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50">Motif</span>
                  <span className="text-white">{formData.label}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={() => setStep('form')} className="flex-1">
                Modifier
              </Button>
              <Button onClick={handleConfirm} loading={loading} className="flex-1">
                Confirmer
              </Button>
            </div>
          </div>
        )}
        
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Virement effectué !</h3>
            <p className="text-white/60 mb-6">
              Le virement de <OrbeCurrency amount={BigInt(Math.round(amountNum * 100))} /> a été envoyé.
            </p>
            <Button onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        )}
        
        {step === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Erreur</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <Button onClick={() => setStep('form')} variant="secondary" className="w-full">
              Réessayer
            </Button>
          </div>
        )}
      </Modal>
    </>
  )
}
