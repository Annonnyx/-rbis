// ============================================
// app/suggestions/page.tsx (amélioré)
// Liste des suggestions avec tri, filtres et modal détail
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
import { prisma } from '@/lib/prisma'
import { Lightbulb, Plus, TrendingUp, Clock, Filter } from 'lucide-react'

interface SuggestionsPageProps {
  searchParams: {
    status?: string
    sort?: string
    page?: string
  }
}

export default async function SuggestionsPage({ searchParams }: SuggestionsPageProps) {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  const status = searchParams.status as any
  const sort = searchParams.sort || 'votes' // 'votes' | 'recent'
  const page = parseInt(searchParams.page || '1')
  
  // Récupérer les suggestions
  const result = await getSuggestions(status, page, 20)
  
  // Compter les suggestions actives
  const activeCount = await prisma.suggestion.count({
    where: { status: 'PENDING' },
  })
  
  if (!result.success) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-red-400">Erreur lors du chargement des suggestions</p>
      </div>
    )
  }
  
  // Trier les suggestions
  let suggestions = result.suggestions || []
  if (sort === 'votes') {
    suggestions = suggestions.sort((a: any, b: any) => (b._count?.votes || 0) - (a._count?.votes || 0))
  }
  // Par défaut déjà trié par date (recent)
  
  // Vérifier les votes
  const suggestionsWithVotes = await Promise.all(
    (result.suggestions || []).map(async (suggestion: any) => {
      const voteResult = await checkUserVote(user.id, suggestion.id)
      return {
        ...suggestion,
        hasVoted: voteResult.success ? voteResult.hasVoted : false,
      }
    })
  )
  
  const buildUrl = (params: Record<string, string>) => {
    const current = new URLSearchParams(searchParams as Record<string, string>)
    Object.entries(params).forEach(([key, value]) => {
      if (value) current.set(key, value)
      else current.delete(key)
    })
    const query = current.toString()
    return `/suggestions${query ? `?${query}` : ''}`
  }
  
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Suggestions"
        description={`${activeCount} idées actives • Le monde Ørbis évolue grâce à vous`}
        action={
          <Link href="/suggestions/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle suggestion
            </Button>
          </Link>
        }
      />
      
      {/* Filtres et tri */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/50">Filtres:</span>
        </div>
        
        {/* Filtre status */}
        <div className="flex flex-wrap gap-2">
          <Link href={buildUrl({ status: '' })}>
            <Badge variant={!status ? 'violet' : 'neutral'} className="cursor-pointer">
              Toutes
            </Badge>
          </Link>
          <Link href={buildUrl({ status: 'PENDING' })}>
            <Badge variant={status === 'PENDING' ? 'violet' : 'neutral'} className="cursor-pointer">
              En attente
            </Badge>
          </Link>
          <Link href={buildUrl({ status: 'ACCEPTED' })}>
            <Badge variant={status === 'ACCEPTED' ? 'violet' : 'neutral'} className="cursor-pointer">
              Acceptées
            </Badge>
          </Link>
          <Link href={buildUrl({ status: 'IMPLEMENTED' })}>
            <Badge variant={status === 'IMPLEMENTED' ? 'success' : 'neutral'} className="cursor-pointer">
              Implémentées
            </Badge>
          </Link>
          <Link href={buildUrl({ status: 'REJECTED' })}>
            <Badge variant={status === 'REJECTED' ? 'warning' : 'neutral'} className="cursor-pointer">
              Rejetées
            </Badge>
          </Link>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-white/50">Tri:</span>
          <Link href={buildUrl({ sort: 'votes' })}>
            <Badge variant={sort === 'votes' ? 'violet' : 'neutral'} className="cursor-pointer flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Plus votées
            </Badge>
          </Link>
          <Link href={buildUrl({ sort: 'recent' })}>
            <Badge variant={sort === 'recent' ? 'violet' : 'neutral'} className="cursor-pointer flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Plus récentes
            </Badge>
          </Link>
        </div>
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
                showDetailButton
              />
            ))}
          </div>
        )}
      </Suspense>
      
      {/* Pagination */}
      {result.pagination && result.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={buildUrl({ page: p.toString() })}>
              <Button variant={p === page ? 'primary' : 'secondary'} size="sm">
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
