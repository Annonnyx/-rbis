// ============================================
// app/suggestions/new/page.tsx
// Création d'une suggestion
// ============================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Lightbulb, ArrowLeft } from 'lucide-react'
import { createSuggestion } from '@/app/actions/suggestions'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export default function NewSuggestionPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!user) {
      setError('Vous devez être connecté')
      return
    }
    
    if (!formData.title.trim() || formData.title.length > 100) {
      setError('Titre requis (max 100 caractères)')
      return
    }
    
    if (!formData.description.trim()) {
      setError('Description requise')
      return
    }
    
    setLoading(true)
    setError('')
    
    const result = await createSuggestion(user.id, {
      title: formData.title,
      description: formData.description,
    })
    
    if (result.success) {
      router.push('/suggestions')
    } else {
      setError(result.error || 'Erreur')
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <Link href="/suggestions" className="inline-flex items-center text-white/50 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Retour aux suggestions
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-violet-400" />
          Nouvelle suggestion
        </h1>
        <p className="text-white/50 mt-2">
          Proposez une fonctionnalité, une amélioration ou une idée pour Ørbis.
        </p>
      </div>
      
      <GlassCard padding="lg">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Titre de votre suggestion"
            placeholder="Ex: Ajouter un système de messagerie entre joueurs"
            maxLength={100}
            value={formData.title}
            onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
            required
          />
          
          <Textarea
            label="Description détaillée"
            placeholder="Décrivez votre idée en détail. Pourquoi est-ce utile ? Comment cela fonctionnerait-il ?"
            maxLength={2000}
            showCount
            rows={8}
            value={formData.description}
            onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
            required
          />
          
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-300">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Les suggestions sont soumises à l'approbation de la communauté. 
              Plus votre idée reçoit de votes, plus elle a de chances d'être implémentée.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/suggestions" className="flex-1">
              <Button variant="secondary" className="w-full">
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              loading={loading}
              disabled={userLoading}
              className="flex-1"
            >
              Soumettre la suggestion
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
