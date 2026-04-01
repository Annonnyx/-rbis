// ============================================
// components/ui/Input.tsx
// Input avec label intégré, erreur et icônes
// @example <Input label="Email" error="Invalide" leftIcon={<Mail />} />
// ============================================

import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * Input stylisé avec support label, erreur et icônes
 * Accessible : label associé via htmlFor
 */
export function Input({ 
  label, 
  error, 
  leftIcon, 
  rightIcon,
  className,
  id,
  ...props 
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-white/70"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3',
            'text-white placeholder-white/30',
            'focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20',
            'focus:outline-none transition-all duration-200',
            leftIcon && 'pl-11',
            rightIcon && 'pr-11',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
