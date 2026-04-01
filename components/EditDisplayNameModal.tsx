// ============================================
// components/EditDisplayNameModal.tsx
// Modal pour modifier le displayName avec double confirmation
// ============================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { AlertCircle, Check } from 'lucide-react'
import { updateDisplayName } from '@/app/actions/profile'

interface EditDisplayNameModalProps {
  isOpen: boolean
  onClose: () => void
  currentDisplayName: string | null
  userId: string
  alreadyChanged: boolean
}

export function EditDisplayNameModal({
  isOpen,
  onClose,
  currentDisplayName,
  userId,
  alreadyChanged,
}: EditDisplayNameModalProps) {
  const router = useRouter()
  const [newName, setNewName] = useState(currentDisplayName || '')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmChecked || alreadyChanged) return
    
    setLoading(true)
    const trimmed = newName.trim()
    
    if (trimmed.length < 2 || trimmed.length > 50) {
      setResult({ success: false, error: 'Le nom doit contenir entre 2 et 50 caractères' })
      setLoading(false)
      return
    }
    
    const response = await updateDisplayName(userId, trimmed)
    setResult(response)
    setLoading(false)
    
    if (response.success) {
      setTimeout(() => {
        onClose()
        router.refresh()
      }, 1500)
    }
  }
  
  // Si déjà modifié
  if (alreadyChanged) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Modifier le nom">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Modification déjà utilisée</h3>
          <p className="text-white/60">
            Vous avez déjà modifié votre nom d'affichage une fois. Cette action est irréversible.
          </p>
          <Button onClick={onClose} className="w-full mt-6">
            Fermer
          </Button>
        </div>
      </Modal>
    )
  }
  
  // Succès
  if (result?.success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Succès !">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nom mis à jour</h3>
          <p className="text-white/60">
            Votre nouveau nom d'affichage est maintenant actif.
          </p>
          <Button onClick={onClose} className="w-full mt-6">
            Fermer
          </Button>
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le nom d'affichage">
      <form onSubmit={handleSubmit} className="space-y-6">
        {result?.error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {result.error}
          </div>
        )}
        
        <Input
          label="Nouveau nom d'affichage"
          placeholder="Votre nouveau nom"
          maxLength={50}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>⚠ Cette action est irréversible</strong> — vous ne pourrez plus changer votre nom d'affichage par la suite.
            </span>
          </p>
        </div>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmChecked}
            onChange={(e) => setConfirmChecked(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-white/70">
            Je comprends que cette modification est définitive et ne pourra pas être annulée.
          </span>
        </label>
        
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button 
            type="submit" 
            loading={loading}
            disabled={!confirmChecked || newName.trim().length < 2}
            className="flex-1"
          >
            Confirmer la modification
          </Button>
        </div>
      </form>
    </Modal>
  )
}
