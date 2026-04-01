// ============================================
// components/StatBadge.tsx
// Petite carte stat avec label, valeur et tendance optionnelle
// @example <StatBadge label="Solde" value="1 000" trend="up" />
// ============================================

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

export interface StatBadgeProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  icon?: LucideIcon
  className?: string
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendColors = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-white/40',
}

/**
 * Badge de statistique avec valeur et tendance
 * Usage : dashboards, résumés, indicateurs clés
 */
export function StatBadge({ 
  label, 
  value, 
  trend,
  icon: Icon,
  className 
}: StatBadgeProps) {
  const TrendIcon = trend ? trendIcons[trend] : null
  
  return (
    <div className={cn(
      'backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-white/30" />}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xl font-semibold text-white">{value}</span>
        {TrendIcon && trend && (
          <TrendIcon className={cn('w-4 h-4', trendColors[trend])} />
        )}
      </div>
    </div>
  )
}
