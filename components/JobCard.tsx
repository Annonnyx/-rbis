// ============================================
// components/JobCard.tsx
// Card d'offre d'emploi
// ============================================

import { GlassCard } from './ui/GlassCard'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { OrbeCurrency } from './OrbeCurrency'
import { Building2, Award, Users, CheckCircle } from 'lucide-react'
import type { JobWithDetails } from '@/app/actions/employment'

interface JobCardProps {
  job: JobWithDetails
  onApply?: () => void
  onClose?: () => void
  isOwner?: boolean
  hasApplied?: boolean
  userSkillLevel?: number
}

export function JobCard({ 
  job, 
  onApply, 
  onClose, 
  isOwner, 
  hasApplied,
  userSkillLevel 
}: JobCardProps) {
  const meetsRequirements = userSkillLevel !== undefined && userSkillLevel >= job.minSkillLevel
  const isFull = job.applications.length >= job.maxEmployees
  
  return (
    <GlassCard className="relative">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white">{job.title}</h3>
            {job.status === 'OPEN' ? (
              <Badge variant="success">Ouvert</Badge>
            ) : (
              <Badge variant="neutral">Fermé</Badge>
            )}
          </div>
          
          <p className="text-sm text-white/60 mb-3">{job.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-white/50">
              <Building2 className="w-4 h-4" />
              {job.company.name}
            </span>
            <span className="flex items-center gap-1 text-white/50">
              <span className="text-lg">{job.skillCategory.icon}</span>
              {job.skillCategory.name} (niveau {job.minSkillLevel}+)
            </span>
            <span className="flex items-center gap-1 text-white/50">
              <Users className="w-4 h-4" />
              {job.applications.length} / {job.maxEmployees} postes
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              <OrbeCurrency amount={job.salaryPerDay} />
            </p>
            <p className="text-xs text-white/40">par jour</p>
          </div>
          
          {isOwner ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-red-400 hover:text-red-300"
            >
              Fermer l'offre
            </Button>
          ) : hasApplied ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Déjà postulé
            </Badge>
          ) : (
            <Button 
              onClick={onApply}
              disabled={!meetsRequirements || isFull || job.status !== 'OPEN'}
              size="sm"
            >
              {isFull ? 'Complet' : meetsRequirements ? 'Postuler' : `Niveau ${job.minSkillLevel} requis`}
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
