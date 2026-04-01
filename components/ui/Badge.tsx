// ============================================
// components/ui/Badge.tsx
// Badges avec couleurs sémantiques
// @example <Badge variant="success">Validé</Badge>
// ============================================

import { cn } from '@/lib/utils'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'violet'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  neutral: 'bg-white/5 text-white/60 border-white/10',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

/**
 * Badge avec couleur sémantique
 * Usage : status, catégories, indicateurs
 */
export function Badge({ 
  children, 
  variant = 'neutral',
  className 
}: BadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
