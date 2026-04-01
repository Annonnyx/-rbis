// ============================================
// app/quests/page.tsx
// Page des quêtes
// ============================================

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { getUserQuests, getQuestStats, generateDailyQuests, generateWeeklyQuests } from '@/app/actions/quests'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/EmptyState'
import { Target, Calendar, Award, Clock } from 'lucide-react'

export default async function QuestsPage() {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  // Générer les quêtes si nécessaire
  await generateDailyQuests(user.id)
  await generateWeeklyQuests(user.id)
  
  // Récupérer les quêtes
  const [dailyResult, weeklyResult, permanentResult, statsResult] = await Promise.all([
    getUserQuests(user.id, 'DAILY'),
    getUserQuests(user.id, 'WEEKLY'),
    getUserQuests(user.id, 'PERMANENT'),
    getQuestStats(user.id),
  ])
  
  const dailyQuests = dailyResult.success ? dailyResult.data : []
  const weeklyQuests = weeklyResult.success ? weeklyResult.data : []
  const permanentQuests = permanentResult.success ? permanentResult.data : []
  const stats = statsResult.success ? statsResult.data : { completed: 0, active: 0, totalOrbesEarned: 0 }
  
  const renderQuestCard = (quest: any) => {
    const progress = (quest.progress as any)?.current || 0
    const target = (quest.progress as any)?.target || 1
    const progressPercent = Math.min(100, (progress / target) * 100)
    const isCompleted = quest.status === 'COMPLETED'
    
    return (
      <GlassCard key={quest.id} className={isCompleted ? 'opacity-75' : ''}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-500/20' : 'bg-violet-500/20'
            }`}>
              {isCompleted ? (
                <Award className="w-5 h-5 text-green-400" />
              ) : (
                <Target className="w-5 h-5 text-violet-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-white">{quest.questTemplate.title}</p>
              <p className="text-sm text-white/50">{quest.questTemplate.description}</p>
            </div>
          </div>
          <Badge variant={isCompleted ? 'success' : 'violet'}>
            {isCompleted ? 'Complétée' : 'En cours'}
          </Badge>
        </div>
        
        {/* Progress bar */}
        {!isCompleted && (
          <div className="mb-3">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-1 text-right">
              {progress} / {target}
            </p>
          </div>
        )}
        
        {/* Rewards and expiry */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-400">
            Récompense: <OrbeCurrency amount={quest.questTemplate.rewardOrbes} />
          </span>
          {quest.expiresAt && !isCompleted && (
            <span className="text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expire {new Date(quest.expiresAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </GlassCard>
    )
  }
  
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Quêtes"
        description="Complétez des objectifs pour gagner des récompenses"
      />
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <GlassCard padding="md" className="text-center">
          <p className="text-2xl font-bold text-white">{stats.completed}</p>
          <p className="text-xs text-white/50">Quêtes complétées</p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <p className="text-2xl font-bold text-white">{stats.active}</p>
          <p className="text-xs text-white/50">Quêtes actives</p>
        </GlassCard>
        <GlassCard padding="md" className="text-center">
          <p className="text-2xl font-bold text-amber-400">
            <OrbeCurrency amount={BigInt(stats.totalOrbesEarned)} />
          </p>
          <p className="text-xs text-white/50">Orbes gagnés</p>
        </GlassCard>
      </div>
      
      <Tabs defaultValue="daily">
        <TabsList className="mb-6">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Quotidiennes
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Hebdomadaires
          </TabsTrigger>
          <TabsTrigger value="permanent" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Permanentes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          {dailyQuests.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Aucune quête quotidienne"
              description="Revenez demain pour de nouvelles quêtes !"
            />
          ) : (
            dailyQuests.map(renderQuestCard)
          )}
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          {weeklyQuests.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Aucune quête hebdomadaire"
              description="Revenez la semaine prochaine pour de nouvelles quêtes !"
            />
          ) : (
            weeklyQuests.map(renderQuestCard)
          )}
        </TabsContent>
        
        <TabsContent value="permanent" className="space-y-4">
          {permanentQuests.length === 0 ? (
            <EmptyState
              icon={Award}
              title="Aucune quête permanente"
              description="Toutes les quêtes permanentes sont complétées !"
            />
          ) : (
            permanentQuests.map(renderQuestCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
