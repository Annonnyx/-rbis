import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface GlassCardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function GlassCard({ children, className, padding = 'md' }: GlassCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={clsx(
        'backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
