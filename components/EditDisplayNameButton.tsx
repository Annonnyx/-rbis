// ============================================
// components/EditDisplayNameButton.tsx
// Bouton client pour ouvrir le modal d'édition
// ============================================

'use client'

import { useState } from 'react'
import { Button } from './ui/Button'
import { EditDisplayNameModal } from './EditDisplayNameModal'
import { Pencil, Lock } from 'lucide-react'

interface EditDisplayNameButtonProps {
  currentDisplayName: string | null
  userId: string
  alreadyChanged: boolean
}

export function EditDisplayNameButton({
  currentDisplayName,
  userId,
  alreadyChanged,
}: EditDisplayNameButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button
        variant={alreadyChanged ? 'ghost' : 'secondary'}
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={alreadyChanged}
        className={alreadyChanged ? 'text-white/40 cursor-not-allowed' : ''}
      >
        {alreadyChanged ? (
          <>
            <Lock className="w-4 h-4 mr-1" />
            Modification déjà utilisée
          </>
        ) : (
          <>
            <Pencil className="w-4 h-4 mr-1" />
            Modifier le nom
          </>
        )}
      </Button>
      
      <EditDisplayNameModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentDisplayName={currentDisplayName}
        userId={userId}
        alreadyChanged={alreadyChanged}
      />
    </>
  )
}
