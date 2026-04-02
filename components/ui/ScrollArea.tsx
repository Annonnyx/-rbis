// ============================================
// components/ui/ScrollArea.tsx
// Zone de défilement personnalisée
// ============================================

'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollAreaProps {
  children: ReactNode
  className?: string
  height?: string
}

export function ScrollArea({ children, className, height = '400px' }: ScrollAreaProps) {
  return (
    <div 
      className={cn('overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent', className)}
      style={{ height, maxHeight: height }}
    >
      {children}
    </div>
  )
}
