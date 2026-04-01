// ============================================
// components/OrbeCurrency.tsx
// Affichage formaté de la monnaie Ørbis (◎)
// @example <OrbeCurrency amount={100000n} size="lg" />
// ============================================

import { formatOrbe } from '@/lib/currency'
import { cn } from '@/lib/utils'

export interface OrbeCurrencyProps {
  /** Montant en centimes (BigInt) */
  amount: bigint
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl font-semibold',
}

/**
 * Affiche un montant en Orbe formaté
 * Montant attendu en centimes (BigInt), affichage en format décimal
 */
export function OrbeCurrency({ amount, size = 'md', className }: OrbeCurrencyProps) {
  return (
    <span className={cn('text-white tabular-nums', sizes[size], className)}>
      {formatOrbe(amount)}
    </span>
  )
}
