// ============================================
// components/BuySharesModal.tsx
// Modal pour acheter des actions
// ============================================

'use client'

import { useState, useMemo } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { GlassCard } from './ui/GlassCard'
import { OrbeCurrency } from './OrbeCurrency'
import { StockChart } from './StockChart'
import { buyShares, getPriceHistory, type ListedCompany } from '@/app/actions/market'
import { toOrbe, toCentimes } from '@/lib/currency'
import { AlertCircle, TrendingUp, Users, Package } from 'lucide-react'

interface BuySharesModalProps {
  company: ListedCompany
  isOpen: boolean
  onClose: () => void
  userBalance: bigint
  onSuccess: () => void
}

export function BuySharesModal({ 
  company, 
  isOpen, 
  onClose, 
  userBalance,
  onSuccess 
}: BuySharesModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ success: boolean; data?: any } | null>(null)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  
  const shareInfo = company.shareInfo
  const currentPrice = shareInfo?.currentPrice || 0n
  const maxBuyable = shareInfo?.availableShares || 0
  
  const totalCost = useMemo(() => {
    return BigInt(quantity) * currentPrice
  }, [quantity, currentPrice])
  
  const canBuy = quantity > 0 && 
                 quantity <= maxBuyable && 
                 totalCost <= userBalance &&
                 totalCost > 0n
  
  async function handleBuy() {
    if (!canBuy) return
    
    setLoading(true)
    setError('')
    
    const response = await buyShares('', company.id, quantity)
    
    if (response.success) {
      setResult({ success: true, data: response.data })
      onSuccess()
    } else {
      setError(response.error || 'Erreur lors de l\'achat')
    }
    
    setLoading(false)
  }
  
  // Charger l'historique des prix quand le modal s'ouvre
  if (isOpen && priceHistory.length === 0) {
    getPriceHistory(company.id, '7d').then(result => {
      if (result.success && result.data) {
        setPriceHistory(result.data)
      }
    })
  }
  
  const priceChange = priceHistory.length >= 2
    ? Number(priceHistory[priceHistory.length - 1].price - priceHistory[0].price) / Number(priceHistory[0].price) * 100
    : 0
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Acheter des actions - ${company.name}`}
    >
      {result?.success ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Achat confirmé !</h3>
          <p className="text-white/60 mb-4">
            Vous avez acheté {quantity} action{quantity > 1 ? 's' : ''} de {company.name}
          </p>
          <p className="text-lg font-bold text-violet-400">
            <OrbeCurrency amount={totalCost} />
          </p>
          <Button onClick={onClose} className="w-full mt-6">
            Fermer
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Graphique */}
          {priceHistory.length > 0 && (
            <GlassCard padding="sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-white/50">Évolution sur 7 jours</span>
                <span className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                </span>
              </div>
              <StockChart prices={priceHistory} height={150} showArea />
            </GlassCard>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <GlassCard padding="sm" className="text-center">
              <p className="text-xs text-white/40 mb-1">Prix unitaire</p>
              <p className="font-bold text-white">
                <OrbeCurrency amount={currentPrice} />
              </p>
            </GlassCard>
            <GlassCard padding="sm" className="text-center">
              <p className="text-xs text-white/40 mb-1">Disponible</p>
              <p className="font-bold text-white">{maxBuyable}</p>
            </GlassCard>
            <GlassCard padding="sm" className="text-center">
              <p className="text-xs text-white/40 mb-1">Actionnaires</p>
              <p className="font-bold text-white flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                {shareInfo?.totalShares || 0}
              </p>
            </GlassCard>
          </div>
          
          {/* Formulaire */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Quantité à acheter
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={Math.min(maxBuyable, 1000)}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <Input
                type="number"
                min={1}
                max={maxBuyable}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center"
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              Max: {Math.min(maxBuyable, Math.floor(Number(userBalance) / Number(currentPrice)))} actions (selon votre solde)
            </p>
          </div>
          
          {/* Récap */}
          <GlassCard className="bg-violet-500/5 border-violet-500/20">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Coût total</span>
              <span className="text-xl font-bold text-white">
                <OrbeCurrency amount={totalCost} />
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-white/50">Solde après achat</span>
              <span className={userBalance - totalCost < 0n ? 'text-red-400' : 'text-white/70'}>
                <OrbeCurrency amount={userBalance - totalCost} />
              </span>
            </div>
          </GlassCard>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleBuy} 
              loading={loading}
              disabled={!canBuy}
              className="flex-1"
            >
              <Package className="w-4 h-4 mr-1" />
              Confirmer l'achat
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
