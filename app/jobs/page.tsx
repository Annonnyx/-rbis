// ============================================
// app/jobs/page.tsx
// Liste des offres d'emploi
// ============================================

import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { getJobPostings } from '@/app/actions/employment'
import { getUserSkills } from '@/lib/skills'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { JobCard } from '@/components/JobCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { SkillBar } from '@/components/SkillBar'
import { Briefcase, Filter, TrendingUp } from 'lucide-react'

interface JobsPageProps {
  searchParams: {
    skill?: string
    minSalary?: string
  }
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const user = await getCurrentUser()
  
  if (!user) redirect('/auth/login')
  if (!user.gameProfile) redirect('/auth/register')
  
  const skillFilter = searchParams.skill
  const minSalary = searchParams.minSalary ? BigInt(searchParams.minSalary) : undefined
  
  // Récupérer les offres
  const jobsResult = await getJobPostings({
    ...(skillFilter && { skillCategoryId: skillFilter }),
    ...(minSalary && { minSalary }),
  })
  
  // Récupérer les compétences de l'utilisateur
  const userSkills = await getUserSkills(user.id)
  
  // Récupérer toutes les catégories de compétences pour les filtres
  const skillCategories = await prisma.skillCategory.findMany()
  
  const jobs = jobsResult.success ? (jobsResult.data ?? []) : []
  
  const buildUrl = (params: Record<string, string>) => {
    const current = new URLSearchParams(searchParams as Record<string, string>)
    Object.entries(params).forEach(([key, value]) => {
      if (value) current.set(key, value)
      else current.delete(key)
    })
    const query = current.toString()
    return `/jobs${query ? `?${query}` : ''}`
  }
  
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Offres d'emploi"
        description="Trouvez un emploi et développez vos compétences"
      />
      
      {/* Mes compétences */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          Mes compétences
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {userSkills.map(skill => (
            <SkillBar
              key={skill.name}
              name={skill.name}
              icon={skill.icon}
              level={skill.level}
              experience={skill.experience}
              progress={skill.progress}
              xpToNext={skill.xpToNext}
            />
          ))}
        </div>
      </section>
      
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/50">Filtres:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link href={buildUrl({ skill: '' })}>
            <Badge variant={!skillFilter ? 'violet' : 'neutral'} className="cursor-pointer">
              Toutes compétences
            </Badge>
          </Link>
          {skillCategories.map(cat => (
            <Link key={cat.id} href={buildUrl({ skill: cat.id })}>
              <Badge 
                variant={skillFilter === cat.id ? 'violet' : 'neutral'} 
                className="cursor-pointer flex items-center gap-1"
              >
                <span>{cat.icon}</span>
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Liste des offres */}
      <Suspense fallback={<LoadingSkeleton variant="card" count={5} />}>
        {jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Aucune offre disponible"
            description="Il n'y a pas d'offres d'emploi correspondant à vos critères. Revenez plus tard ou consultez les entreprises directement."
          />
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const userSkill = userSkills.find(s => s.name === job.skillCategory.name)
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  userSkillLevel={userSkill?.level}
                />
              )
            })}
          </div>
        )}
      </Suspense>
    </div>
  )
}
