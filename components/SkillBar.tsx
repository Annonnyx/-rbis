// ============================================
// components/SkillBar.tsx
// Barre de progression pour les compétences
// ============================================

'use client'

import { GlassCard } from './ui/GlassCard'
import { ProgressBar } from './ProgressBar'

interface SkillBarProps {
  name: string
  icon: string
  level: number
  experience: number
  progress: number
  xpToNext: number
}

export function SkillBar({ name, icon, level, experience, progress, xpToNext }: SkillBarProps) {
  const levelColors = [
    'from-gray-500 to-gray-600',
    'from-green-500 to-emerald-600',
    'from-blue-500 to-cyan-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
  ]
  
  const colorClass = levelColors[Math.min(level - 1, 4)]
  
  return (
    <GlassCard padding="sm" className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colorClass}`} />
      
      <div className="flex items-center justify-between mb-2 pl-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-white">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">Niveau</span>
          <span className={`text-lg font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
            {level}
          </span>
          {level === 5 && <span className="text-xs text-amber-400">MAX</span>}
        </div>
      </div>
      
      <div className="pl-3">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/40">
          <span>{experience} XP</span>
          {xpToNext > 0 ? (
            <span>{xpToNext} XP pour niveau {level + 1}</span>
          ) : (
            <span>Niveau maximum atteint</span>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
