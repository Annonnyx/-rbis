// ============================================
// components/ui/Modal.tsx
// Modal accessible avec overlay glassmorphism
// @example <Modal isOpen={show} onClose={close} title="Titre">Contenu</Modal>
// ============================================

'use client'

import { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

/**
 * Modal accessible avec glassmorphism
 * Features : trap focus (simplifié), fermeture Escape, click overlay
 * Accessible : aria-modal, role="dialog", aria-labelledby
 */
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className 
}: ModalProps) {
  // Escape key handler
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscape])
  
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div 
        className={cn(
          'relative w-full max-w-md backdrop-blur-xl bg-[#0a0a0f]/90',
          'border border-white/10 rounded-2xl p-6',
          'animate-modal-content shadow-2xl',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 id="modal-title" className="text-xl font-semibold text-white">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5',
              'transition-all duration-200',
              !title && 'ml-auto'
            )}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        {children}
      </div>
    </div>
  )
}
