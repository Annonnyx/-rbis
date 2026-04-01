// ============================================
// components/IPOButton.tsx
// Bouton pour ouvrir le modal d'IPO (client component)
// ============================================

'use client'

import { useState } from 'react'
import { Button } from './ui/Button'
import { IPOModal } from './IPOModal'
import { TrendingUp } from 'lucide-react'

interface IPOButtonProps {
  companyId: string
  companyName: string
  companyCapital: bigint
}

export function IPOButton({ companyId, companyName, companyCapital }: IPOButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button 
        variant="primary" 
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        Introduire en bourse
      </Button>
      
      <IPOModal
        companyId={companyId}
        companyName={companyName}
        companyCapital={companyCapital}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => setIsOpen(false)}
      />
    </>
  )
}
