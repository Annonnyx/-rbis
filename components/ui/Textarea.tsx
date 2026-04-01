// ============================================
// components/ui/Textarea.tsx
// Textarea avec label, compteur de caractères et validation
// @example <Textarea label="Description" maxLength={500} showCount />
// ============================================

import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  showCount?: boolean
  maxLength?: number
}

/**
 * Textarea stylisé avec support compteur de caractères
 * Accessible : label associé, compteur annoncé aux lecteurs d'écran
 */
export function Textarea({ 
  label, 
  error, 
  showCount = false,
  maxLength,
  className,
  id,
  value,
  ...props 
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const currentLength = typeof value === 'string' ? value.length : 0
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-white/70"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3',
          'text-white placeholder-white/30 min-h-[100px] resize-y',
          'focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20',
          'focus:outline-none transition-all duration-200',
          error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
          className
        )}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : showCount ? `${textareaId}-count` : undefined}
        value={value}
        {...props}
      />
      <div className="flex justify-between items-center">
        {error && (
          <p 
            id={`${textareaId}-error`}
            className="text-sm text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {showCount && maxLength && (
          <p 
            id={`${textareaId}-count`}
            className={cn(
              'text-sm ml-auto',
              currentLength >= maxLength ? 'text-red-400' : 'text-white/40'
            )}
            aria-live="polite"
          >
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
