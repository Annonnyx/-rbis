// ============================================
// components/EmployeeRow.tsx
// Ligne d'employé pour la page entreprise
// ============================================

import { GlassCard } from './ui/GlassCard'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { OrbeCurrency } from './OrbeCurrency'
import { User, Calendar, DollarSign, X } from 'lucide-react'
import type { EmploymentWithDetails } from '@/app/actions/employment'

interface EmployeeRowProps {
  employment: EmploymentWithDetails
  onTerminate?: () => void
  isOwner?: boolean
}

export function EmployeeRow({ employment, onTerminate, isOwner }: EmployeeRowProps) {
  const daysEmployed = Math.floor(
    (Date.now() - new Date(employment.startedAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const lastPaid = employment.lastPaidAt
    ? Math.floor((Date.now() - new Date(employment.lastPaidAt).getTime()) / (1000 * 60 * 60 * 24))
    : null
  
  return (
    <GlassCard className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <p className="font-medium text-white">
            {employment.employee.displayName || employment.employee.username}
          </p>
          <p className="text-sm text-white/50">
            {employment.jobPosting.title} • {employment.jobPosting.skillCategory.name}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 md:gap-8">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Calendar className="w-4 h-4" />
          <span>{daysEmployed} jours</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-white/40" />
          <span className="text-white font-medium">
            <OrbeCurrency amount={employment.salaryPerDay} />
          </span>
          <span className="text-white/40">/jour</span>
        </div>
        
        {lastPaid !== null && lastPaid > 1 && (
          <Badge variant="warning" className="text-xs">
            Non payé depuis {lastPaid} jours
          </Badge>
        )}
        
        {isOwner && onTerminate && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onTerminate}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4 mr-1" />
            Licencier
          </Button>
        )}
      </div>
    </GlassCard>
  )
}
