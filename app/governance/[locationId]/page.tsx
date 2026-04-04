// ============================================
// app/governance/[locationId]/page.tsx
// Gouvernance d'une ville spécifique
// ============================================

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { 
  getElections, 
  getCurrentRepresentative, 
  getTaxConfig, 
  getLaws 
} from '@/app/actions/governance'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { EmptyState } from '@/components/EmptyState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Crown, Vote, Gavel, ArrowLeft, Users, Percent } from 'lucide-react'

interface GovernanceCityPageProps {
  params: { locationId: string }
}

export default async function GovernanceCityPage({ params }: GovernanceCityPageProps) {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer la ville
  const location = await prisma.mapLocation.findUnique({
    where: { id: params.locationId },
  })
  
  if (!location) notFound()
  
  // Vérifier si l'utilisateur réside ici
  const isResident = user.gameProfile.homeLocationId === location.id
  
  // Récupérer les données
  const [electionsResult, representativeResult, taxResult, lawsResult] = await Promise.all([
    getElections(params.locationId),
    getCurrentRepresentative(params.locationId),
    getTaxConfig(params.locationId),
    getLaws(params.locationId),
  ])
  
  const elections = electionsResult.success ? (electionsResult.data || []) : []
  const representative = representativeResult.success && representativeResult.data ? representativeResult.data.representative : null
  const taxConfig = taxResult.success ? taxResult.data : null
  const laws = lawsResult.success ? (lawsResult.data ?? []) : []
  
  const isRepresentative = representative?.userId === user.id
  
  // Élection en cours ?
  const activeElection = elections.find(e => e.status === 'OPEN')
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link href="/governance" className="text-sm text-white/50 hover:text-white flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Retour à la gouvernance
      </Link>
      
      <PageHeader
        title={location.name}
        description="Gouvernance locale et élections"
      />
      
      {/* Représentant actuel */}
      <GlassCard className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <div className="flex-1">
            {representative ? (
              <>
                <p className="text-sm text-white/50">Représentant actuel</p>
                <p className="text-xl font-bold text-white">
                  {representative.user.displayName || representative.user.username}
                </p>
                <p className="text-sm text-white/60">
                  Mandat jusqu'au {new Date(representative.mandateEndsAt).toLocaleDateString('fr-FR')}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-white/50">Représentant</p>
                <p className="text-lg text-white/60">Aucun représentant actuel</p>
              </>
            )}
          </div>
          
          {taxConfig && (
            <div className="text-right">
              <p className="text-sm text-white/50">Taxes actuelles</p>
              <p className="text-white">
                Transactions: {(taxConfig.transactionTaxRate * 100).toFixed(1)}%
              </p>
              <p className="text-white">
                Production: {(taxConfig.productionTaxRate * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </GlassCard>
      
      <Tabs defaultValue="elections">
        <TabsList className="mb-6">
          <TabsTrigger value="elections">
            <Vote className="w-4 h-4 mr-2" />
            Élections
          </TabsTrigger>
          <TabsTrigger value="laws">
            <Gavel className="w-4 h-4 mr-2" />
            Lois
          </TabsTrigger>
        </TabsList>
        
        {/* Élections */}
        <TabsContent value="elections">
          <div className="space-y-4">
            {activeElection ? (
              <GlassCard className="border-violet-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge variant="success" className="mb-2">Élection en cours</Badge>
                    <p className="text-lg font-semibold text-white">
                      Se termine le {new Date(activeElection.endsAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {isResident && (
                    <Button>Participer</Button>
                  )}
                </div>
                
                <h3 className="text-sm font-medium text-white/50 mb-3">Candidats</h3>
                <div className="space-y-2">
                  {activeElection.candidates.map(candidate => (
                    <div 
                      key={candidate.id} 
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                          <span className="text-violet-400 font-medium">
                            {(candidate.user.displayName || candidate.user.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {candidate.user.displayName || candidate.user.username}
                          </p>
                          <p className="text-sm text-white/50 line-clamp-1">
                            {candidate.manifesto.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-violet-400">{candidate.votes}</p>
                        <p className="text-xs text-white/40">votes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <EmptyState
                icon={Vote}
                title="Aucune élection en cours"
                description={isResident ? "Les élections ont lieu tous les 30 jours" : "Rejoignez cette ville pour voter"}
              />
            )}
            
            {/* Historique */}
            <h3 className="text-sm font-medium text-white/50 mt-6 mb-3">Historique des élections</h3>
            {elections.filter(e => e.status !== 'OPEN').map(election => (
              <GlassCard key={election.id} className="opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={election.status === 'CLOSED' ? 'neutral' : 'warning'}>
                      {election.status === 'CLOSED' ? 'Terminée' : 'Annulée'}
                    </Badge>
                    <p className="text-sm text-white/60 mt-1">
                      {new Date(election.startedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {election.winnerId && (
                    <p className="text-sm text-white/60">
                      Gagnant: {election.candidates.find(c => c.userId === election.winnerId)?.user.username}
                    </p>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>
        
        {/* Lois */}
        <TabsContent value="laws">
          <div className="space-y-4">
            {/* Bouton proposer */}
            {isResident && (
              <div className="text-center mb-6">
                <Button variant="secondary">Proposer une loi</Button>
              </div>
            )}
            
            {/* Lois en vote */}
            <h3 className="text-sm font-medium text-white/50 mb-3">Lois en vote</h3>
            {laws.filter(l => l.status === 'PROPOSED').map(law => (
              <GlassCard key={law.id}>
                <div className="flex items-start gap-3">
                  <Gavel className="w-5 h-5 text-violet-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-white">{law.title}</p>
                    <p className="text-sm text-white/60 mb-2">{law.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">Pour: {law.votesFor}</span>
                      <span className="text-red-400">Contre: {law.votesAgainst}</span>
                      <span className="text-white/40">
                        Vote jusqu'au {new Date(law.votingEndsAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
            
            {/* Lois actives */}
            <h3 className="text-sm font-medium text-white/50 mt-6 mb-3">Lois actives</h3>
            {laws.filter(l => l.status === 'ACTIVE').map(law => (
              <GlassCard key={law.id} className="border-green-500/30">
                <div className="flex items-start gap-3">
                  <Gavel className="w-5 h-5 text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{law.title}</p>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-sm text-white/60">{law.description}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
            
            {laws.length === 0 && (
              <EmptyState
                icon={Gavel}
                title="Aucune loi"
                description="Les propositions de lois apparaîtront ici"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
