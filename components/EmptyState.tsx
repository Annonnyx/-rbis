// ============================================
// components/EmptyState.tsx
// État vide générique réutilisable
// @example <EmptyState icon={Building2} title="Aucune entreprise" description="Créez la première" action={<Button>+</Button>} />
// ============================================

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * État vide réutilisable pour les listes vides
 * Usage : dashboards, listes, résultats de recherche
 */
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-4',
      'backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl',
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white/30" />
        </div>
      )}
      
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      
      {description && (
        <p className="text-sm text-white/50 max-w-xs mb-4">{description}</p>
      )}
      
      {action && (
        <div className="mt-2">{action}</div>
      )}
    </div>
  )
}
