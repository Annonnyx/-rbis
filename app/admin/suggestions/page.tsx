// ============================================
// app/admin/suggestions/page.tsx
// Interface admin pour gérer les suggestions
// ============================================

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { getAllSuggestionsForAdmin, updateSuggestionStatus } from '@/app/actions/suggestions'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'
import { AlertCircle, Check, X, Lightbulb, ArrowLeft } from 'lucide-react'
import type { SuggestionStatus } from '@prisma/client'

const statusActions: Record<SuggestionStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral'; icon: any }> = {
  PENDING: { label: 'En attente', variant: 'neutral', icon: AlertCircle },
  ACCEPTED: { label: 'Acceptée', variant: 'info', icon: Check },
  IMPLEMENTED: { label: 'Implémentée', variant: 'success', icon: Check },
  REJECTED: { label: 'Refusée', variant: 'warning', icon: X },
}

export default async function AdminSuggestionsPage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Vérification admin simplifiée - à remplacer par votre logique
  // Par exemple, vérifier si l'userId est dans une liste d'admins
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID
  if (user.id !== ADMIN_USER_ID) {
    redirect('/dashboard')
  }
  
  const result = await getAllSuggestionsForAdmin(user.id)
  
  if (!result.success) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-red-400">Erreur: {result.error}</p>
      </div>
    )
  }
  
  const suggestions = result.suggestions || []
  
  async function handleStatusChange(suggestionId: string, newStatus: SuggestionStatus) {
    'use server'
    const user = await getCurrentUser()
    if (!user) return
    
    await updateSuggestionStatus(suggestionId, newStatus, user.id)
  }
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link href="/suggestions" className="inline-flex items-center text-white/50 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Retour aux suggestions
      </Link>
      
      <PageHeader
        title="Administration des suggestions"
        description={`${suggestions.length} suggestions au total`}
      />
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {(['PENDING', 'ACCEPTED', 'IMPLEMENTED', 'REJECTED'] as SuggestionStatus[]).map(status => {
          const count = suggestions.filter(s => s.status === status).length
          const config = statusActions[status]
          const Icon = config.icon
          
          return (
            <GlassCard key={status} padding="sm" className="text-center">
              <Icon className={`w-5 h-5 mx-auto mb-2 ${
                status === 'PENDING' ? 'text-white/50' :
                status === 'ACCEPTED' ? 'text-blue-400' :
                status === 'IMPLEMENTED' ? 'text-green-400' :
                'text-amber-400'
              }`} />
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-white/50">{config.label}</p>
            </GlassCard>
          )
        })}
      </div>
      
      {/* Liste */}
      {suggestions.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Aucune suggestion"
          description="Le système de suggestions est vide"
        />
      ) : (
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <GlassCard key={suggestion.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">{suggestion.title}</h3>
                    <Badge variant={statusActions[suggestion.status].variant}>
                      {statusActions[suggestion.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2 mb-2">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>Par {suggestion.author.displayName || suggestion.author.username}</span>
                    <span>{suggestion._count.votes} votes</span>
                    <span>{new Date(suggestion.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {suggestion.status !== 'ACCEPTED' && (
                    <form action={async () => {
                      'use server'
                      await handleStatusChange(suggestion.id, 'ACCEPTED')
                    }}>
                      <Button type="submit" size="sm" variant="secondary">
                        Accepter
                      </Button>
                    </form>
                  )}
                  
                  {suggestion.status !== 'IMPLEMENTED' && (
                    <form action={async () => {
                      'use server'
                      await handleStatusChange(suggestion.id, 'IMPLEMENTED')
                    }}>
                      <Button type="submit" size="sm" variant="secondary">
                        Implémenter
                      </Button>
                    </form>
                  )}
                  
                  {suggestion.status !== 'REJECTED' && (
                    <form action={async () => {
                      'use server'
                      await handleStatusChange(suggestion.id, 'REJECTED')
                    }}>
                      <Button type="submit" size="sm" variant="ghost" className="text-red-400">
                        Refuser
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
