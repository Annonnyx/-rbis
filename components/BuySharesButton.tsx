// ============================================
// components/BuySharesButton.tsx
// Bouton pour ouvrir le modal d'achat d'actions
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { BuySharesModal } from './BuySharesModal'
import { getUserAccounts } from '@/app/actions/bank'
import { ShoppingCart } from 'lucide-react'
import type { ListedCompany } from '@/app/actions/market'

interface BuySharesButtonProps {
  company: ListedCompany
  userId: string
}

export function BuySharesButton({ company, userId }: BuySharesButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userBalance, setUserBalance] = useState<bigint>(0n)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      getUserAccounts(userId).then(result => {
        if (result.success) {
          const personalAccount = result.accounts.find(a => a.ownerType === 'PERSONAL')
          setUserBalance(personalAccount?.balance || 0n)
        }
      })
    }
  }, [isOpen, userId])
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2"
      >
        <ShoppingCart className="w-4 h-4" />
        Acheter des actions
      </Button>
      
      <BuySharesModal
        company={company}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userBalance={userBalance}
        onSuccess={() => setIsOpen(false)}
      />
    </>
  )
}
