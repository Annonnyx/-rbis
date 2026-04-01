// ============================================
// app/governance/page.tsx
// Hub gouvernance - représentants et élections
// ============================================

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/EmptyState'
import { Crown, MapPin, Vote, Gavel } from 'lucide-react'

export default async function GovernancePage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer tous les représentants actuels
  const representatives = await prisma.cityRepresentative.findMany({
    include: {
      user: { select: { id: true, username: true, displayName: true } },
      location: true,
    },
    orderBy: { electedAt: 'desc' },
  })
  
  // Récupérer les élections en cours
  const activeElections = await prisma.election.findMany({
    where: { status: 'OPEN' },
    include: {
      location: true,
      candidates: { include: { user: { select: { username: true } } } },
      _count: { select: { votes: true } },
    },
    orderBy: { endsAt: 'asc' },
  })
  
  // Récupérer les lois actives
  const activeLaws = await prisma.communityLaw.findMany({
    where: { status: 'ACTIVE' },
    include: {
      location: true,
      proposer: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Gouvernance"
        description="Représentants, élections et lois communautaires"
      />
      
      {/* Représentants actuels */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          Représentants actuels
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {representatives.map(rep => (
            <Link key={rep.id} href={`/governance/${rep.locationId}`}>
              <GlassCard hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{rep.location.name}</p>
                  <p className="text-sm text-white/60">
                    Représentant: {rep.user.displayName || rep.user.username}
                  </p>
                  <p className="text-xs text-white/40">
                    Mandat jusqu'au {new Date(rep.mandateEndsAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </GlassCard>
            </Link>
          ))}
          
          {representatives.length === 0 && (
            <EmptyState
              icon={Crown}
              title="Aucun représentant"
              description="Les élections n'ont pas encore eu lieu dans les villes"
            />
          )}
        </div>
      </section>
      
      {/* Élections en cours */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Vote className="w-5 h-5 text-violet-400" />
          Élections en cours
        </h2>
        
        <div className="space-y-4">
          {activeElections.map(election => {
            const daysLeft = Math.ceil((new Date(election.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            
            return (
              <Link key={election.id} href={`/governance/${election.locationId}`}>
                <GlassCard hover>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-white/50" />
                        <span className="font-medium text-white">{election.location.name}</span>
                        <Badge variant="success">En cours</Badge>
                      </div>
                      <p className="text-sm text-white/60">
                        {election.candidates.length} candidat(s) • {election._count.votes} vote(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${daysLeft <= 2 ? 'text-red-400' : 'text-white/60'}`}>
                        {daysLeft} jour(s) restant(s)
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            )
          })}
          
          {activeElections.length === 0 && (
            <EmptyState
              icon={Vote}
              title="Aucune élection en cours"
              description="Les élections ont lieu tous les 30 jours"
            />
          )}
        </div>
      </section>
      
      {/* Lois actives */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Gavel className="w-5 h-5 text-violet-400" />
          Lois communautaires actives
        </h2>
        
        <div className="space-y-4">
          {activeLaws.map(law => (
            <GlassCard key={law.id}>
              <div className="flex items-start gap-3">
                <Gavel className="w-5 h-5 text-violet-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-white">{law.title}</p>
                  <p className="text-sm text-white/60 mb-2">{law.location.name}</p>
                  <p className="text-sm text-white/80">{law.description}</p>
                  <p className="text-xs text-white/40 mt-2">
                    Proposée par {law.proposer.username} • {new Date(law.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
          
          {activeLaws.length === 0 && (
            <EmptyState
              icon={Gavel}
              title="Aucune loi active"
              description="Les propositions de lois apparaîtront ici"
            />
          )}
        </div>
      </section>
    </div>
  )
}
