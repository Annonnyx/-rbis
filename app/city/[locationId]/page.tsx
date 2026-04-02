// ============================================
// app/city/[locationId]/page.tsx
// Page de ville avec chat public et annonces
// ============================================

import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { getCityMessages, getCityAnnouncements, getCityStats, type CityChatWithAuthor } from '@/app/actions/city'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/EmptyState'
import { MapPin, Users, Building2, MessageSquare, Megaphone } from 'lucide-react'
import Link from 'next/link'

interface CityPageProps {
  params: { locationId: string }
}

export default async function CityPage({ params }: CityPageProps) {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Récupérer la ville
  const location = await prisma.mapLocation.findUnique({
    where: { id: params.locationId },
  })
  
  if (!location) notFound()
  
  // Vérifier que l'utilisateur réside ici
  const canChat = user.gameProfile.homeLocationId === location.id
  
  // Récupérer les données
  const [messagesResult, announcementsResult, statsResult] = await Promise.all([
    getCityMessages(params.locationId),
    getCityAnnouncements(params.locationId),
    getCityStats(params.locationId),
  ])
  
  const messages = messagesResult.success && messagesResult.data ? messagesResult.data.messages : []
  const announcements = announcementsResult.success ? announcementsResult.data : []
  const stats = statsResult.success ? statsResult.data : { residents: 0, companies: 0, recentMessages: 0 }
  
  // TypeScript safety: ensure stats is never undefined
  const safeStats = stats || { residents: 0, companies: 0, recentMessages: 0 }
  
  // Récupérer les entreprises de la ville
  const companies = await prisma.company.findMany({
    where: { locationId: params.locationId },
    select: { id: true, name: true, objective: true, owner: { select: { username: true } } },
    take: 10,
  })
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title={location.name}
        description="Chat public, annonces et entreprises de la ville"
      />
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <GlassCard padding="md" className="text-center">
          <Users className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{safeStats.residents}</p>
          <p className="text-xs text-white/50">Habitants</p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <Building2 className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{safeStats.companies}</p>
          <p className="text-xs text-white/50">Entreprises</p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <MessageSquare className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{safeStats.recentMessages}</p>
          <p className="text-xs text-white/50">Messages 24h</p>
        </GlassCard>
      </div>
      
      {/* Onglets */}
      <Tabs defaultValue="chat">
        <TabsList className="mb-6">
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Megaphone className="w-4 h-4 mr-2" />
            Annonces
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="w-4 h-4 mr-2" />
            Entreprises
          </TabsTrigger>
        </TabsList>
        
        {/* Chat */}
        <TabsContent value="chat">
          <GlassCard>
            <div className="h-[400px] overflow-y-auto space-y-4 p-4">
              {messages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Pas encore de messages"
                  description={canChat ? "Soyez le premier à écrire !" : "Rejoignez cette ville pour chatter"}
                />
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-400 text-xs font-medium">
                        {(msg.author.displayName || msg.author.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">
                          {msg.author.displayName || msg.author.username}
                        </span>
                        <span className="text-xs text-white/30">
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-white/80">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {canChat && (
              <div className="p-4 border-t border-white/10">
                <p className="text-sm text-white/50">Zone de saisie du chat (temps réel via Supabase)</p>
              </div>
            )}
          </GlassCard>
        </TabsContent>
        
        {/* Annonces */}
        <TabsContent value="announcements">
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="Aucune annonce"
                description="Il n'y a pas d'annonces dans cette ville"
              />
            ) : (
              announcements.map(ann => (
                <GlassCard key={ann.id}>
                  <div className="flex items-start gap-4">
                    {ann.pinned && (
                      <Badge variant="violet" className="flex-shrink-0">Épinglé</Badge>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{ann.title}</h3>
                      <p className="text-white/70 mb-2">{ann.content}</p>
                      <p className="text-xs text-white/40">
                        Par {ann.author.displayName || ann.author.username} • {new Date(ann.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Entreprises */}
        <TabsContent value="companies">
          <div className="grid md:grid-cols-2 gap-4">
            {companies.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Aucune entreprise"
                description="Il n'y a pas encore d'entreprise dans cette ville"
              />
            ) : (
              companies.map(company => (
                <Link key={company.id} href={`/company/${company.id}`}>
                  <GlassCard hover className="h-full">
                    <h3 className="font-semibold text-white mb-1">{company.name}</h3>
                    <p className="text-sm text-white/50 line-clamp-2">{company.objective}</p>
                    <p className="text-xs text-white/30 mt-2">par {company.owner.username}</p>
                  </GlassCard>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
