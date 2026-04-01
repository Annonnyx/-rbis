'use client'

import { clsx } from 'clsx'
import { Home, Building2, Lock } from 'lucide-react'

interface MapPinProps {
  type: 'home' | 'company' | 'locked'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MapPin({ type, size = 'md', className = '' }: MapPinProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  }

  const baseClasses = `
    rounded-full flex items-center justify-center
    border-2 transition-all duration-200
  `

  if (type === 'locked') {
    return (
      <div
        className={clsx(
          baseClasses,
          sizeClasses[size],
          'bg-gray-600/50 border-gray-400/50 text-gray-300',
          className
        )}
      >
        <Lock size={iconSizes[size]} />
      </div>
    )
  }

  if (type === 'home') {
    return (
      <div
        className={clsx(
          baseClasses,
          sizeClasses[size],
          'bg-violet-500/80 border-violet-400 text-white',
          className
        )}
      >
        <Home size={iconSizes[size]} />
      </div>
    )
  }

  return (
    <div
      className={clsx(
        baseClasses,
        sizeClasses[size],
        'bg-cyan-500/80 border-cyan-400 text-white',
        className
      )}
    >
      <Building2 size={iconSizes[size]} />
    </div>
  )
}
