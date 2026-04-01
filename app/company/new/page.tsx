// ============================================
// app/company/new/page.tsx
// Création d'une entreprise
// ============================================

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { Badge } from '@/components/ui/Badge'
import { createCompany } from '@/app/actions/company'
import { toOrbe, toCentimes } from '@/lib/currency'
import { AlertCircle, Building2, Check, Wallet } from 'lucide-react'
import type { BankAccount } from '@/types'

interface CompanyNewPageProps {
  accounts: BankAccount[]
  userLocationId: string
  userLocationName: string
}

export default function NewCompanyPage({ 
  accounts, 
  userLocationId, 
  userLocationName 
}: CompanyNewPageProps) {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'confirm' | 'creating' | 'success'>('form')
  const [error, setError] = useState('')
  
  const personalAccount = accounts.find(a => a.ownerType === 'PERSONAL')
  const maxCapital = personalAccount ? toOrbe(personalAccount.balance) : 0
  
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    description: '',
    capital: 300,
  })
  
  const remainingBalance = useMemo(() => {
    return Math.max(0, maxCapital - formData.capital)
  }, [maxCapital, formData.capital])
  
  const canCreate = formData.name.length > 0 && 
                    formData.objective.length > 0 && 
                    formData.capital >= 300 && 
                    formData.capital <= maxCapital
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canCreate) return
    setStep('confirm')
  }
  
  async function handleConfirm() {
    setStep('creating')
    
    const result = await createCompany(personalAccount?.ownerId || '', {
      name: formData.name,
      objective: formData.objective,
      description: formData.description,
      locationId: userLocationId,
      initialCapital: formData.capital,
    })
    
    if (result.success) {
      setStep('success')
      setTimeout(() => {
        router.push(`/company/${result.data?.companyId}`)
      }, 1500)
    } else {
      setError(result.error || 'Erreur')
      setStep('form')
    }
  }
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Créer une entreprise</h1>
        <p className="text-white/50 mt-1">Lancez votre projet dans {userLocationName}</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nom de l'entreprise"
            placeholder="Mon Entreprise Inc."
            maxLength={50}
            value={formData.name}
            onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
            required
          />
          
          <Input
            label="Mission / Objectif"
            placeholder="En une phrase, quel est votre but ?"
            maxLength={200}
            value={formData.objective}
            onChange={e => setFormData(d => ({ ...d, objective: e.target.value }))}
            required
          />
          
          <Textarea
            label="Description du produit ou service"
            placeholder="Décrivez ce que vous proposez..."
            maxLength={500}
            showCount
            value={formData.description}
            onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
            rows={5}
          />
          
          {/* Capital slider */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">
              Capital de départ
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={300}
                max={maxCapital}
                step={100}
                value={formData.capital}
                onChange={e => setFormData(d => ({ ...d, capital: parseFloat(e.target.value) }))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="w-32">
                <Input
                  type="number"
                  min={300}
                  max={maxCapital}
                  step={0.01}
                  value={formData.capital}
                  onChange={e => setFormData(d => ({ ...d, capital: parseFloat(e.target.value) || 0 }))}
                  className="text-right"
                />
              </div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-white/40">Min : ◎ 300,00</span>
              <span className="text-white/40">
                Max : <OrbeCurrency amount={personalAccount?.balance || 0n} />
              </span>
            </div>
          </div>
          
          {formData.capital > maxCapital && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Capital supérieur à votre solde disponible
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!canCreate}
          >
            Continuer
          </Button>
        </form>
        
        {/* Aperçu temps réel */}
        <div className="lg:sticky lg:top-8">
          <GlassCard className="h-full">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-400" />
              Aperçu
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Nom</p>
                <p className="text-xl font-semibold text-white">
                  {formData.name || 'Votre Entreprise'}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Mission</p>
                <p className="text-white/80">
                  {formData.objective || 'Votre mission...'}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Capital investi</p>
                <p className="text-2xl font-bold text-white">
                  <OrbeCurrency amount={toCentimes(formData.capital)} />
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Solde restant
                  </span>
                  <span className="text-white font-medium">
                    <OrbeCurrency amount={toCentimes(remainingBalance)} />
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Localisation</p>
                <p className="text-white flex items-center gap-2">
                  📍 {userLocationName}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
      
      {/* Modal de confirmation */}
      <Modal 
        isOpen={step === 'confirm' || step === 'creating'} 
        onClose={() => step !== 'creating' && setStep('form')}
        title="Confirmer la création"
      >
        {step === 'confirm' ? (
          <div className="space-y-4">
            <p className="text-white/60">
              Vous êtes sur le point de créer <strong className="text-white">{formData.name}</strong> avec un capital de{' '}
              <strong className="text-violet-400">
                <OrbeCurrency amount={toCentimes(formData.capital)} />
              </strong>.
            </p>
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-300">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Cette action est irréversible. Le capital sera transféré sur le compte de l'entreprise.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('form')} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Créer l'entreprise
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4" />
            <p className="text-white">Création en cours...</p>
          </div>
        )}
      </Modal>
      
      {/* Modal de succès */}
      <Modal isOpen={step === 'success'} onClose={() => {}} title="Succès !">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Entreprise créée !</h3>
          <p className="text-white/60">
            Redirection vers votre fiche entreprise...
          </p>
        </div>
      </Modal>
    </div>
  )
}
