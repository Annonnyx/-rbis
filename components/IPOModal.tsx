// ============================================
// components/IPOModal.tsx
// Modal pour introduire une entreprise en bourse (IPO)
// ============================================

'use client'

import { useState, useMemo } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { GlassCard } from './ui/GlassCard'
import { OrbeCurrency } from './OrbeCurrency'
import { listCompanyOnMarket, type IPOData } from '@/app/actions/market'
import { toCentimes } from '@/lib/currency'
import { AlertCircle, Building2, PieChart, TrendingUp } from 'lucide-react'

interface IPOModalProps {
  companyId: string
  companyName: string
  companyCapital: bigint
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function IPOModal({ 
  companyId, 
  companyName, 
  companyCapital,
  isOpen, 
  onClose, 
  onSuccess 
}: IPOModalProps) {
  const MIN_CAPITAL = 100000n // ◎ 1 000,00
  const MIN_SHARES = 100
  const MIN_PRICE = 0.01 // ◎ 0,01 = 1 centime
  
  const [totalShares, setTotalShares] = useState(1000)
  const [pricePerShare, setPricePerShare] = useState(10) // ◎ 10,00 par défaut
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ success: boolean; data?: any } | null>(null)
  
  const isEligible = companyCapital >= MIN_CAPITAL
  
  // Calculs
  const ipoShares = Math.floor(totalShares * 0.3)
  const companyShares = totalShares - ipoShares
  const ipoRevenue = BigInt(ipoShares) * toCentimes(pricePerShare)
  const marketCap = BigInt(totalShares) * toCentimes(pricePerShare)
  
  const canProceed = isEligible && 
                     totalShares >= MIN_SHARES && 
                     pricePerShare >= MIN_PRICE
  
  async function handleIPO() {
    if (!canProceed) return
    
    setLoading(true)
    setError('')
    
    const response = await listCompanyOnMarket('', companyId, {
      totalShares,
      pricePerShare,
    })
    
    if (response.success) {
      setResult({ success: true, data: response.data })
      onSuccess()
    } else {
      setError(response.error || 'Erreur lors de l\'introduction en bourse')
    }
    
    setLoading(false)
  }
  
  if (!isEligible) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Introduction en bourse">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Capital insuffisant</h3>
          <p className="text-white/60 mb-4">
            Pour être cotée en bourse, votre entreprise doit avoir un capital minimum de
          </p>
          <p className="text-2xl font-bold text-violet-400">
            <OrbeCurrency amount={MIN_CAPITAL} />
          </p>
          <p className="text-sm text-white/40 mt-2">
            Capital actuel: <OrbeCurrency amount={companyCapital} />
          </p>
          <Button onClick={onClose} className="w-full mt-6">
            Fermer
          </Button>
        </div>
      </Modal>
    )
  }
  
  if (result?.success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="IPO Réussie !">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {companyName} est maintenant cotée !
          </h3>
          <p className="text-white/60 mb-6">
            Votre entreprise est introduite en bourse avec succès.
          </p>
          
          <div className="space-y-2 text-left max-w-xs mx-auto mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Actions émises</span>
              <span className="text-white">{result.data?.ipoShares} actions</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Revenus IPO</span>
              <span className="text-violet-400">
                <OrbeCurrency amount={ipoRevenue} />
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Actions conservées</span>
              <span className="text-white">{result.data?.companyShares} actions (70%)</span>
            </div>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Voir sur la bourse
          </Button>
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Introduire en bourse (IPO)">
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              L'introduction en bourse est irréversible. 30% des actions seront vendues 
              à l'IPO, 70% resteront en votre possession.
            </span>
          </p>
        </div>
        
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {/* Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Nombre total d'actions à émettre
            </label>
            <Input
              type="number"
              min={MIN_SHARES}
              max={1000000}
              value={totalShares}
              onChange={(e) => setTotalShares(Math.max(MIN_SHARES, parseInt(e.target.value) || MIN_SHARES))}
            />
            <p className="text-xs text-white/40 mt-1">Minimum: {MIN_SHARES} actions</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Prix initial par action (◎)
            </label>
            <Input
              type="number"
              min={MIN_PRICE}
              step={0.01}
              value={pricePerShare}
              onChange={(e) => setPricePerShare(Math.max(MIN_PRICE, parseFloat(e.target.value) || MIN_PRICE))}
            />
            <p className="text-xs text-white/40 mt-1">Minimum: ◎ 0,01</p>
          </div>
        </div>
        
        {/* Récap */}
        <GlassCard className="border-violet-500/20">
          <h4 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-400" />
            Répartition
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Actions IPO (30%)</span>
              <span className="text-white font-medium">{ipoShares} actions</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Actions conservées (70%)</span>
              <span className="text-white font-medium">{companyShares} actions</span>
            </div>
            <div className="h-px bg-white/10 my-3" />
            <div className="flex justify-between items-center">
              <span className="text-white/60">Revenus attendus (IPO)</span>
              <span className="text-violet-400 font-bold">
                <OrbeCurrency amount={ipoRevenue} />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Capitalisation totale</span>
              <span className="text-white font-medium">
                <OrbeCurrency amount={marketCap} />
              </span>
            </div>
          </div>
        </GlassCard>
        
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button 
            onClick={handleIPO} 
            loading={loading}
            disabled={!canProceed}
            className="flex-1"
          >
            <Building2 className="w-4 h-4 mr-1" />
            Confirmer l'IPO
          </Button>
        </div>
      </div>
    </Modal>
  )
}
