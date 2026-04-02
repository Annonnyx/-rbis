// ============================================
// app/alliances/[id]/page.tsx
// Détail d'une alliance
// ============================================

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { getAllianceById, leaveAlliance, kickMember, getUserAlliance } from '@/app/actions/alliance'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { EmptyState } from '@/components/EmptyState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Crown, Users, Wallet, ArrowLeft, LogOut, UserX, TrendingUp } from 'lucide-react'

interface AlliancePageProps {
  params: { id: string }
}

export default async function AllianceDetailPage({ params }: AlliancePageProps) {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer l'alliance
  const allianceResult = await getAllianceById(params.id)
  
  if (!allianceResult.success || !allianceResult.data) {
    notFound()
  }
  
  const alliance = allianceResult.data
  
  // Vérifier si l'utilisateur est membre
  const userMembership = alliance.members.find(m => m.user.id === user.id)
  const isFounder = userMembership?.role === 'FOUNDER'
  const isAdmin = userMembership?.role === 'ADMIN' || isFounder
  
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link href="/alliances" className="text-sm text-white/50 hover:text-white flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Retour aux alliances
      </Link>
      
      <PageHeader
        title={alliance.name}
        description={alliance.description}
      />
      
      {/* Header avec stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <GlassCard padding="md" className="text-center">
          <Users className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{alliance._count.members}</p>
          <p className="text-xs text-white/50">Membres</p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <Wallet className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">
            <OrbeCurrency amount={alliance.treasury?.balance || BigInt(0)} />
          </p>
          <p className="text-xs text-white/50">Trésorerie</p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <Badge 
            variant={alliance.type === 'COOPERATIVE' ? 'success' : 'violet'}
            className="mx-auto mb-1"
          >
            {alliance.type === 'COOPERATIVE' ? 'Coopérative' : 'Syndicat'}
          </Badge>
          <p className="text-lg font-bold text-white">
            {alliance.type === 'COOPERATIVE' ? '+10%' : 'Bonus'}
          </p>
          <p className="text-xs text-white/50">
            {alliance.type === 'COOPERATIVE' ? 'Production' : 'Négociation'}
          </p>
        </GlassCard>
      </div>
      
      <Tabs defaultValue="members">
        <TabsList className="mb-6">
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" />
            Membres
          </TabsTrigger>
          <TabsTrigger value="treasury">
            <Wallet className="w-4 h-4 mr-2" />
            Trésorerie
          </TabsTrigger>
          {alliance.type === 'COOPERATIVE' && (
            <TabsTrigger value="bonus">
              <TrendingUp className="w-4 h-4 mr-2" />
              Bonus
            </TabsTrigger>
          )}
        </TabsList>
        
        {/* Membres */}
        <TabsContent value="members">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Membres</h3>
            <div className="space-y-3">
              {alliance.members.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <span className="text-violet-400 font-medium">
                        {(member.user.displayName || member.user.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {member.user.displayName || member.user.username}
                      </p>
                      <p className="text-xs text-white/50">
                        Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {member.role === 'FOUNDER' && (
                      <Badge variant="amber" className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Fondateur
                      </Badge>
                    )}
                    {member.role === 'ADMIN' && (
                      <Badge variant="violet">Admin</Badge>
                    )}
                    
                    {isAdmin && member.user.id !== user.id && member.role !== 'FOUNDER' && (
                      <form action={async () => {
                        'use server'
                        await kickMember(user.id, alliance.id, member.user.id)
                      }}>
                        <Button variant="ghost" size="sm" className="text-red-400">
                          <UserX className="w-4 h-4" />
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {userMembership && !isFounder && (
              <form 
                action={async () => {
                  'use server'
                  await leaveAlliance(user.id, alliance.id)
                  redirect('/alliances')
                }}
                className="mt-6 pt-4 border-t border-white/10"
              >
                <Button variant="ghost" className="text-red-400 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Quitter l'alliance
                </Button>
              </form>
            )}
          </GlassCard>
        </TabsContent>
        
        {/* Trésorerie */}
        <TabsContent value="treasury">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Trésorerie</h3>
            <div className="text-center py-8">
              <p className="text-sm text-white/50 mb-2">Solde disponible</p>
              <p className="text-4xl font-bold text-white mb-4">
                <OrbeCurrency amount={alliance.treasury?.balance || BigInt(0)} />
              </p>
              
              {userMembership && (
                <div className="flex justify-center gap-2">
                  <Button variant="secondary">Déposer</Button>
                  {isFounder && (
                    <Button variant="secondary">Retirer</Button>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-sm text-white/40 text-center">
              {isFounder 
                ? 'En tant que fondateur, vous pouvez déposer et retirer des fonds.' 
                : 'Les membres peuvent déposer des fonds. Seul le fondateur peut retirer.'}
            </p>
          </GlassCard>
        </TabsContent>
        
        {/* Bonus (coop only) */}
        {alliance.type === 'COOPERATIVE' && (
          <TabsContent value="bonus">
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Bonus Coopérative</h3>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-2xl font-bold text-white mb-2">+10% de production</p>
                <p className="text-white/60 max-w-md mx-auto">
                  Les entreprises des membres de cette coopérative bénéficient d'un 
                  bonus de 10% sur chaque cycle de production.
                </p>
              </div>
            </GlassCard>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
