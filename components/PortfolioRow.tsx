// ============================================
// components/PortfolioRow.tsx
// Ligne de portfolio pour afficher une holding
// ============================================

import { GlassCard } from './ui/GlassCard'
import { Badge } from './ui/Badge'
import { OrbeCurrency } from './OrbeCurrency'
import { TrendingUp, TrendingDown, Building2 } from 'lucide-react'
import type { UserHolding } from '@/app/actions/market'

interface PortfolioRowProps {
  holding: UserHolding
  onClick?: () => void
}

export function PortfolioRow({ holding, onClick }: PortfolioRowProps) {
  const isProfit = holding.profitLoss >= 0n
  const profitPercent = holding.averageBuyPrice > 0n
    ? Number((holding.profitLoss * 100n) / (BigInt(holding.quantity) * holding.averageBuyPrice))
    : 0
  
  return (
    <GlassCard 
      onClick={onClick}
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${onClick ? 'cursor-pointer hover:bg-white/[0.08]' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{holding.companyName}</h3>
          <p className="text-sm text-white/50">
            {holding.quantity} action{holding.quantity > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
        <div className="text-right">
          <p className="text-sm text-white/50">Valeur actuelle</p>
          <p className="font-bold text-white">
            <OrbeCurrency amount={holding.currentValue} />
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-white/50">Prix moyen</p>
          <p className="text-white">
            <OrbeCurrency amount={holding.averageBuyPrice} />
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-white/50">Variation</p>
          <div className={`flex items-center gap-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <OrbeCurrency amount={holding.profitLoss} />
            <span className="text-xs">({profitPercent > 0 ? '+' : ''}{profitPercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
