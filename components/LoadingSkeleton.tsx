// ============================================
// components/LoadingSkeleton.tsx
// Skeletons animés pour états de chargement
// @example <LoadingSkeleton variant="card" />
// ============================================

import { cn } from '@/lib/utils'

export type SkeletonVariant = 'card' | 'row' | 'map' | 'text'

export interface LoadingSkeletonProps {
  variant: SkeletonVariant
  count?: number
  className?: string
}

/**
 * Skeleton animé pour le chargement
 * Variants : card (pleine), row (ligne), map (placeholder carte), text (lignes)
 */
export function LoadingSkeleton({ 
  variant, 
  count = 1,
  className 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn(
            'backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6',
            className
          )}>
            <div className="animate-shimmer h-6 w-1/3 rounded mb-4" />
            <div className="animate-shimmer h-4 w-full rounded mb-2" />
            <div className="animate-shimmer h-4 w-2/3 rounded" />
          </div>
        )
      
      case 'row':
        return (
          <div className={cn(
            'flex items-center gap-4 py-3 px-4 rounded-xl bg-white/[0.02]',
            className
          )}>
            <div className="animate-shimmer w-10 h-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="animate-shimmer h-4 w-1/3 rounded" />
              <div className="animate-shimmer h-3 w-1/4 rounded" />
            </div>
            <div className="animate-shimmer h-6 w-20 rounded" />
          </div>
        )
      
      case 'map':
        return (
          <div className={cn(
            'w-full h-96 rounded-2xl bg-white/5 border border-white/10',
            'flex items-center justify-center',
            className
          )}>
            <div className="animate-shimmer w-32 h-32 rounded-full" />
          </div>
        )
      
      case 'text':
        return (
          <div className={cn('space-y-2', className)}>
            <div className="animate-shimmer h-5 w-full rounded" />
            <div className="animate-shimmer h-5 w-5/6 rounded" />
            <div className="animate-shimmer h-5 w-4/6 rounded" />
          </div>
        )
    }
  }
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={i > 0 ? 'mt-3' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  )
}
