// ============================================
// app/suggestions/page.tsx
// Liste des suggestions avec vote
// ============================================

import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { getSuggestions, checkUserVote } from '@/app/actions/suggestions'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SuggestionCard } from '@/components/SuggestionCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { Lightbulb, Plus } from 'lucide-react'

export default async function SuggestionsPage({ 
  searchParams 
}: { 
  searchParams: { status?: string; page?: string } 
}) {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  const status = searchParams.status as any
  const page = parseInt(searchParams.page || '1')
  
  const result = await getSuggestions(status, page, 20)
  
  if (!result.success) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-red-400">Erreur lors du chargement des suggestions</p>
      </div>
    )
  }
  
  // Vérifier les votes de l'utilisateur pour chaque suggestion
  const suggestionsWithVotes = await Promise.all(
    (result.suggestions || []).map(async (suggestion: any) => {
      const voteResult = await checkUserVote(user.id, suggestion.id)
      return {
        ...suggestion,
        hasVoted: voteResult.success ? voteResult.hasVoted : false,
      }
    })
  )
  
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Suggestions"
        description="Proposez et votez pour les fonctionnalités à venir"
        action={
          <Link href="/suggestions/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle suggestion
            </Button>
          </Link>
        }
      />
      
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/suggestions">
          <Badge variant={!status ? 'violet' : 'neutral'} className="cursor-pointer">
            Toutes
          </Badge>
        </Link>
        <Link href="/suggestions?status=PENDING">
          <Badge variant={status === 'PENDING' ? 'violet' : 'neutral'} className="cursor-pointer">
            En attente
          </Badge>
        </Link>
        <Link href="/suggestions?status=ACCEPTED">
          <Badge variant={status === 'ACCEPTED' ? 'violet' : 'neutral'} className="cursor-pointer">
            Acceptées
          </Badge>
        </Link>
        <Link href="/suggestions?status=IMPLEMENTED">
          <Badge variant={status === 'IMPLEMENTED' ? 'violet' : 'neutral'} className="cursor-pointer">
            Implémentées
          </Badge>
        </Link>
      </div>
      
      {/* Liste */}
      <Suspense fallback={<LoadingSkeleton variant="card" count={5} />}>
        {suggestionsWithVotes.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="Aucune suggestion"
            description="Soyez le premier à proposer une idée !"
            action={
              <Link href="/suggestions/new">
                <Button>Proposer une idée</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {suggestionsWithVotes.map((suggestion: any) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                hasVoted={suggestion.hasVoted}
              />
            ))}
          </div>
        )}
      </Suspense>
      
      {/* Pagination */}
      {result.pagination && result.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/suggestions?${status ? `status=${status}&` : ''}page=${p}`}
            >
              <Button
                variant={p === page ? 'primary' : 'secondary'}
                size="sm"
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
