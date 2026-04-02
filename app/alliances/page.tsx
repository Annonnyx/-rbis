// ============================================
// app/alliances/page.tsx
// Liste des alliances
// ============================================

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/actions/auth'
import { getAlliances, getUserAlliance } from '@/app/actions/alliance'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { EmptyState } from '@/components/EmptyState'
import { Users, Crown, ArrowRight, HandshakeIcon } from 'lucide-react'

export default async function AlliancesPage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer les alliances
  const alliancesResult = await getAlliances()
  const alliances = alliancesResult.success ? alliancesResult.data : []
  
  // Récupérer l'alliance de l'utilisateur
  const userAllianceResult = await getUserAlliance(user.id)
  const userAlliance = userAllianceResult.success ? userAllianceResult.data : null
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Alliances"
        description="Rejoignez un syndicat ou une coopérative"
      />
      
      {/* Mon alliance */}
      {userAlliance && (
        <GlassCard className="mb-8 border-violet-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={userAlliance.type === 'COOPERATIVE' ? 'success' : 'violet'}>
                  {userAlliance.type === 'COOPERATIVE' ? 'Coopérative' : 'Syndicat'}
                </Badge>
                <span className="text-sm text-white/50">Votre alliance</span>
              </div>
              <h2 className="text-xl font-bold text-white">{userAlliance.name}</h2>
              <p className="text-white/60">{userAlliance.description}</p>
            </div>
            <Link href={`/alliances/${userAlliance.id}`}>
              <Button className="flex items-center gap-2">
                Voir
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </GlassCard>
      )}
      
      {/* Liste des alliances */}
      <div className="grid md:grid-cols-2 gap-4">
        {alliances?.length === 0 ? (
          <EmptyState
            icon={HandshakeIcon}
            title="Aucune alliance"
            description="Soyez le premier à créer une alliance !"
            action={!userAlliance && (
              <Link href="/alliances/create">
                <Button>Créer une alliance</Button>
              </Link>
            )}
          />
        ) : (
          alliances?.map(alliance => {
            const isMember = alliance.members.some(m => m.user.id === user.id)
            
            return (
              <GlassCard key={alliance.id} className={isMember ? 'border-violet-500/30' : ''}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge 
                      variant={alliance.type === 'COOPERATIVE' ? 'success' : 'violet'}
                      className="mb-2"
                    >
                      {alliance.type === 'COOPERATIVE' ? 'Coopérative' : 'Syndicat'}
                    </Badge>
                    <h3 className="font-semibold text-white">{alliance.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-white/50">
                      <Users className="w-4 h-4" />
                      {alliance._count.members}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-white/60 mb-4 line-clamp-2">
                  {alliance.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Crown className="w-4 h-4 text-amber-400" />
                    {alliance.founder.displayName || alliance.founder.username}
                  </div>
                  
                  {alliance.treasury && (
                    <span className="text-sm text-white/50">
                      <OrbeCurrency amount={alliance.treasury.balance} />
                    </span>
                  )}
                </div>
                
                <Link href={`/alliances/${alliance.id}`} className="mt-4 block">
                  <Button 
                    variant={isMember ? 'primary' : 'secondary'} 
                    className="w-full"
                  >
                    {isMember ? 'Gérer' : 'Voir'}
                  </Button>
                </Link>
              </GlassCard>
            )
          })
        )}
      </div>
      
      {/* Créer si pas membre */}
      {!userAlliance && (
        <div className="mt-8 text-center">
          <Link href="/alliances/create">
            <Button variant="secondary">
              Créer une nouvelle alliance
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
