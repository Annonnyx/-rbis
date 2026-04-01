// ============================================
// components/ui/GlassCard.tsx
// Surface glassmorphism de base réutilisable
// @example <GlassCard padding="lg" hover>Contenu</GlassCard>
// ============================================

import { cn } from '@/lib/utils'

export interface GlassCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

/**
 * Card avec effet glassmorphism
 * Props extensibles via className pour les cas spéciaux
 */
export function GlassCard({ 
  children, 
  className, 
  padding = 'md',
  hover = false 
}: GlassCardProps) {
  return (
    <div 
      className={cn(
        'backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl',
        paddingClasses[padding],
        hover && 'hover:bg-white/[0.08] transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}
