// ============================================
// components/ui/Button.tsx
// Boutons avec variants, sizes et loading state
// @example <Button variant="primary" size="md" loading>Cliquez</Button>
// ============================================

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const variants = {
  primary: 'bg-violet-600 hover:bg-violet-700 text-white',
  secondary: 'bg-white/5 hover:bg-white/10 border border-white/10 text-white',
  ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white',
  danger: 'bg-red-600/80 hover:bg-red-600 text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
}

/**
 * Bouton stylisé avec support loading et variants
 * Accessible : disabled et aria-busy gérés automatiquement
 */
export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  children, 
  className,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
