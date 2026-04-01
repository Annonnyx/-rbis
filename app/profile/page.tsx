// ============================================
// app/profile/page.tsx
// Page profil utilisateur complète
// ============================================

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { getUserStats } from '@/app/actions/profile'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { EditDisplayNameButton } from '@/components/EditDisplayNameButton'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { 
  User, 
  Building2, 
  Lightbulb, 
  ThumbsUp, 
  Calendar, 
  MapPin, 
  Mail, 
  Lock,
  Wallet
} from 'lucide-react'

// ============================================
// Fonction utilitaire : couleur dérivée du username
// ============================================
function getColorFromUsername(username: string): string {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-fuchsia-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
  ]
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// ============================================
// Section Stats
// ============================================
async function StatsSection({ userId }: { userId: string }) {
  const result = await getUserStats(userId)
  
  if (!result.success || !result.data) {
    return (
      <div className="text-red-400">
        Erreur lors du chargement des statistiques
      </div>
    )
  }
  
  const stats = result.data
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <GlassCard padding="md" className="text-center">
        <Wallet className="w-5 h-5 text-violet-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">
          <OrbeCurrency amount={stats.totalBalance} />
        </p>
        <p className="text-xs text-white/50">Solde total</p>
      </GlassCard>
      
      <GlassCard padding="md" className="text-center">
        <Building2 className="w-5 h-5 text-violet-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">{stats.companiesCount}</p>
        <p className="text-xs text-white/50">Entreprises</p>
      </GlassCard>
      
      <GlassCard padding="md" className="text-center">
        <Lightbulb className="w-5 h-5 text-violet-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">{stats.suggestionsCount}</p>
        <p className="text-xs text-white/50">Suggestions</p>
      </GlassCard>
      
      <GlassCard padding="md" className="text-center">
        <ThumbsUp className="w-5 h-5 text-violet-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">{stats.votesCount}</p>
        <p className="text-xs text-white/50">Votes</p>
      </GlassCard>
    </div>
  )
}

// ============================================
// Main Page
// ============================================
export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer la location de résidence
  const location = await prisma.mapLocation.findUnique({
    where: { id: user.gameProfile.homeLocationId },
  })
  
  const avatarColor = getColorFromUsername(user.username)
  const initial = (user.displayName || user.username).charAt(0).toUpperCase()
  
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Profil"
        description="Gérez votre identité et vos paramètres"
      />
      
      {/* Section Identité */}
      <GlassCard>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div 
            className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-4xl font-bold text-white shadow-lg`}
          >
            {initial}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">
                {user.displayName || user.username}
              </h2>
              {user.displayNameChanged && (
                <Badge variant="neutral" className="text-xs">
                  Modifié
                </Badge>
              )}
            </div>
            <p className="text-white/50">@{user.username}</p>
            
            <div className="mt-4">
              <EditDisplayNameButton
                currentDisplayName={user.displayName}
                userId={user.id}
                alreadyChanged={user.displayNameChanged}
              />
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Section Stats */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-400" />
          Statistiques
        </h3>
        <Suspense fallback={<LoadingSkeleton variant="card" count={4} />}>
          <StatsSection userId={user.id} />
        </Suspense>
      </section>
      
      {/* Section Paramètres */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-violet-400" />
          Paramètres
        </h3>
        
        <div className="space-y-4">
          {/* Email */}
          <GlassCard className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="font-medium text-white">Email</p>
                <p className="text-sm text-white/50">{user.email}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Changer
            </Button>
          </GlassCard>
          
          {/* Mot de passe */}
          <GlassCard className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="font-medium text-white">Mot de passe</p>
                <p className="text-sm text-white/50">••••••••</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Modifier
            </Button>
          </GlassCard>
          
          {/* Localisation */}
          <GlassCard className="flex items-center justify-between opacity-75">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="font-medium text-white">Localisation</p>
                <p className="text-sm text-white/50">
                  {location?.name || 'Inconnue'}
                </p>
              </div>
            </div>
            <Badge variant="neutral">Non modifiable</Badge>
          </GlassCard>
          
          {/* Date d'inscription */}
          <GlassCard className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white/60" />
            </div>
            <div>
              <p className="font-medium text-white">Membre depuis</p>
              <p className="text-sm text-white/50">
                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  )
}
