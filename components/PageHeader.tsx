// ============================================
// components/PageHeader.tsx
// Header standardisé pour toutes les pages
// @example <PageHeader title="Dashboard" description="Bienvenue" action={<Button>Nouveau</Button>} />
// ============================================

import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Header de page cohérent sur tout le site
 * Titre principal + description optionnelle + action optionnelle
 */
export function PageHeader({ 
  title, 
  description, 
  action,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8',
      className
    )}>
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {description && (
          <p className="text-sm text-white/50 mt-1">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  )
}
