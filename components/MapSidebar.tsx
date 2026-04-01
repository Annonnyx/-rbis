// ============================================
// components/MapSidebar.tsx
// Panneau latéral pour la carte (desktop) / bottom sheet mobile
// ============================================

'use client'

import { useState } from 'react'
import { GlassCard } from './ui/GlassCard'
import { Badge } from './ui/Badge'
import { ProgressBar } from './ProgressBar'
import { Lock, Unlock, ChevronUp, ChevronDown, Users, Building2 } from 'lucide-react'

interface MapSidebarProps {
  locations: any[]
  totalUsers: number
}

export function MapSidebar({ locations, totalUsers }: MapSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const unlockedLocations = locations.filter(l => l.unlocked)
  const lockedLocations = locations.filter(l => !l.unlocked)
  
  // Trouver la prochaine ville à débloquer
  const nextUnlock = lockedLocations
    .sort((a, b) => a.requiredUsersToUnlock - b.requiredUsersToUnlock)[0]
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 bg-[#0a0a0f]/90 border-r border-white/10 backdrop-blur-xl overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Carte du monde</h2>
          
          {/* Stats globales */}
          <GlassCard className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">Explorateurs</span>
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
          </GlassCard>
          
          {/* Progression vers prochain déblocage */}
          {nextUnlock && (
            <GlassCard className="mb-6 border-amber-500/20">
              <p className="text-sm text-amber-400 mb-2">Prochaine ville</p>
              <p className="font-semibold text-white mb-2">{nextUnlock.name}</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalUsers / nextUnlock.requiredUsersToUnlock) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/40">
                {totalUsers} / {nextUnlock.requiredUsersToUnlock} membres
              </p>
            </GlassCard>
          )}
          
          {/* Liste des villes débloquées */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              Villes disponibles
            </h3>
            {unlockedLocations.map(location => (
              <div 
                key={location.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{location.name}</span>
                  <Unlock className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {location.residents?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {location.companies?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Villes verrouillées */}
          {lockedLocations.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                Villes verrouillées
              </h3>
              {lockedLocations.map(location => (
                <div 
                  key={location.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white/60">{location.name}</span>
                    <Lock className="w-4 h-4 text-white/30" />
                  </div>
                  <p className="text-xs text-white/30 mt-1">
                    {location.requiredUsersToUnlock} membres requis
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Bottom Sheet */}
      <div className={`
        lg:hidden fixed bottom-0 left-0 right-0 z-40
        bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10
        transition-all duration-300
        ${isExpanded ? 'h-[70vh]' : 'h-20'}
      `}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 flex items-center justify-center gap-2 text-white/50"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          <span className="text-sm">
            {isExpanded ? 'Fermer' : `${unlockedLocations.length} villes • ${totalUsers} membres`}
          </span>
        </button>
        
        <div className={`px-4 pb-4 overflow-y-auto ${isExpanded ? 'h-[calc(70vh-3rem)]' : 'hidden'}`}>
          {/* Même contenu que desktop */}
          <div className="space-y-3">
            {unlockedLocations.map(location => (
              <div 
                key={location.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="font-medium text-white">{location.name}</span>
                <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                  <span>{location.residents?.length || 0} résidents</span>
                  <span>{location.companies?.length || 0} entreprises</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
