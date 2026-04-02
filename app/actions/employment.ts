// ============================================
// app/actions/employment.ts
// Server Actions pour le système d'emploi
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { toCentimes, toOrbe } from '@/lib/currency'
import { awardExperience, XP_REWARDS } from '@/lib/skills'
import type { ActionResult } from '@/types'
import type { JobStatus, EmploymentStatus } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface CreateJobData {
  title: string
  description: string
  skillCategoryId: string
  minSkillLevel: number
  salaryPerDay: number // en Orbe
  maxEmployees?: number
}

export interface JobWithDetails {
  id: string
  title: string
  description: string
  skillCategory: { name: string; icon: string }
  minSkillLevel: number
  salaryPerDay: bigint
  maxEmployees: number
  status: JobStatus
  company: { id: string; name: string }
  applications: { id: string; employeeId: string; status: EmploymentStatus }[]
}

export interface EmploymentWithDetails {
  id: string
  employee: { id: string; username: string; displayName: string | null }
  company: { id: string; name: string }
  jobPosting: { title: string; skillCategory: { name: string } }
  salaryPerDay: bigint
  startedAt: Date
  lastPaidAt: Date | null
  status: EmploymentStatus
}

// ============================================
// OFFRES D'EMPLOI (JOB POSTINGS)
// ============================================

/**
 * Crée une nouvelle offre d'emploi
 */
export async function createJobPosting(
  userId: string,
  companyId: string,
  data: CreateJobData
): Promise<ActionResult<{ jobId: string }>> {
  try {
    // Vérifier que l'utilisateur est propriétaire de l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    })
    
    if (!company || company.ownerId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    // Validation
    if (!data.title.trim() || data.title.length > 100) {
      return { success: false, error: 'Titre invalide (max 100 caractères)' }
    }
    
    if (data.minSkillLevel < 1 || data.minSkillLevel > 5) {
      return { success: false, error: 'Niveau minimum invalide (1-5)' }
    }
    
    const salaryInCentimes = toCentimes(data.salaryPerDay)
    if (salaryInCentimes < BigInt(1)) {
      return { success: false, error: 'Salaire minimum: ◎ 0,01' }
    }
    
    const job = await prisma.jobPosting.create({
      data: {
        companyId,
        title: data.title.trim(),
        description: data.description.trim(),
        skillCategoryId: data.skillCategoryId,
        minSkillLevel: data.minSkillLevel,
        salaryPerDay: salaryInCentimes,
        maxEmployees: data.maxEmployees || 1,
        status: 'OPEN',
      },
    })
    
    revalidatePath(`/company/${companyId}`)
    revalidatePath('/jobs')
    
    return { success: true, data: { jobId: job.id } }
  } catch (error: any) {
    console.error('Create job posting error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère toutes les offres d'emploi ouvertes
 */
export async function getJobPostings(
  filters?: {
    skillCategoryId?: string
    minSalary?: bigint
    companyId?: string
  }
): Promise<ActionResult<JobWithDetails[]>> {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: {
        status: 'OPEN',
        ...(filters?.skillCategoryId && { skillCategoryId: filters.skillCategoryId }),
        ...(filters?.companyId && { companyId: filters.companyId }),
        ...(filters?.minSalary && { salaryPerDay: { gte: filters.minSalary } }),
      },
      include: {
        skillCategory: true,
        company: { select: { id: true, name: true } },
        applications: {
          where: { status: 'ACTIVE' },
          select: { id: true, employeeId: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return { success: true, data: jobs }
  } catch (error) {
    console.error('Get job postings error:', error)
    return { success: false, error: 'Erreur lors de la récupération des offres' }
  }
}

/**
 * Ferme une offre d'emploi
 */
export async function closeJobPosting(
  userId: string,
  jobId: string
): Promise<ActionResult> {
  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { company: true },
    })
    
    if (!job || job.company.ownerId !== userId) {
      return { success: false, error: 'Non autorisé' }
    }
    
    await prisma.jobPosting.update({
      where: { id: jobId },
      data: { status: 'CLOSED' },
    })
    
    revalidatePath(`/company/${job.companyId}`)
    revalidatePath('/jobs')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// CANDIDATURES ET EMBAUCHES
// ============================================

/**
 * Postuler à une offre d'emploi
 */
export async function applyToJob(
  userId: string,
  jobId: string
): Promise<ActionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Vérifier que l'offre existe et est ouverte
      const job = await tx.jobPosting.findUnique({
        where: { id: jobId },
        include: {
          skillCategory: true,
          applications: { where: { status: 'ACTIVE' } },
        },
      })
      
      if (!job || job.status !== 'OPEN') {
        throw new Error('Offre introuvable ou fermée')
      }
      
      // Vérifier que le nombre max d'employés n'est pas atteint
      if (job.applications.length >= job.maxEmployees) {
        throw new Error('Cette offre est complète')
      }
      
      // Vérifier que l'utilisateur n'est pas déjà employé ailleurs
      const existingEmployment = await tx.employment.findFirst({
        where: {
          employeeId: userId,
          status: 'ACTIVE',
        },
      })
      
      if (existingEmployment) {
        throw new Error('Vous avez déjà un emploi actif. Démissionnez d\'abord.')
      }
      
      // Vérifier le niveau de compétence requis
      const userSkill = await tx.userSkill.findUnique({
        where: {
          userId_skillCategoryId: {
            userId,
            skillCategoryId: job.skillCategoryId,
          },
        },
      })
      
      if (!userSkill || userSkill.level < job.minSkillLevel) {
        throw new Error(`Niveau ${job.minSkillLevel} requis en ${job.skillCategory.name}. Vous êtes niveau ${userSkill?.level || 1}.`)
      }
      
      // Créer l'employment (candidature)
      const employment = await tx.employment.create({
        data: {
          employeeId: userId,
          companyId: job.companyId,
          jobPostingId: jobId,
          salaryPerDay: job.salaryPerDay,
          status: 'ACTIVE',
        },
      })
      
      // Attribuer XP Management au recruteur (si c'est une candidature auto-acceptée)
      await awardExperience(userId, job.skillCategory.name, XP_REWARDS.COMPLETE_CONTRACT)
      
      return employment
    })
    
    revalidatePath('/jobs')
    revalidatePath('/profile')
    
    return { success: true }
  } catch (error: any) {
    console.error('Apply to job error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Démissionner ou licencier
 */
export async function terminateEmployment(
  userId: string,
  employmentId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const employment = await tx.employment.findUnique({
        where: { id: employmentId },
        include: {
          company: true,
          employee: true,
          jobPosting: { include: { skillCategory: true } },
        },
      })
      
      if (!employment) {
        throw new Error('Emploi introuvable')
      }
      
      const isOwner = employment.company.ownerId === userId
      const isEmployee = employment.employeeId === userId
      
      if (!isOwner && !isEmployee) {
        throw new Error('Non autorisé')
      }
      
      if (employment.status !== 'ACTIVE') {
        throw new Error('Cet emploi est déjà terminé')
      }
      
      // Calculer le salaire prorata pour aujourd'hui
      const now = new Date()
      const lastPaid = employment.lastPaidAt || employment.startedAt
      const daysSinceLastPay = Math.floor((now.getTime() - lastPaid.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastPay > 0) {
        const prorataAmount = employment.salaryPerDay * BigInt(daysSinceLastPay)
        
        // Payer le salaire prorata
        const companyAccount = await tx.bankAccount.findFirst({
          where: { ownerId: employment.company.ownerId, ownerType: 'PERSONAL' },
        })
        
        const employeeAccount = await tx.bankAccount.findFirst({
          where: { ownerId: employment.employeeId, ownerType: 'PERSONAL' },
        })
        
        if (companyAccount && employeeAccount && companyAccount.balance >= prorataAmount) {
          await tx.bankAccount.update({
            where: { id: companyAccount.id },
            data: { balance: { decrement: prorataAmount } },
          })
          
          await tx.bankAccount.update({
            where: { id: employeeAccount.id },
            data: { balance: { increment: prorataAmount } },
          })
          
          await tx.salaryPayment.create({
            data: {
              employmentId,
              amount: prorataAmount,
              daysPaid: daysSinceLastPay,
            },
          })
        }
      }
      
      // Terminer l'emploi
      await tx.employment.update({
        where: { id: employmentId },
        data: {
          status: 'TERMINATED',
          terminatedAt: now,
          terminationReason: reason || (isOwner ? 'Licenciement' : 'Démission'),
        },
      })
      
      return { terminated: true, reason: isOwner ? 'Licenciement' : 'Démission' }
    })
    
    revalidatePath('/profile')
    revalidatePath('/company')
    
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Terminate employment error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// SALAIRES
// ============================================

/**
 * Traite les paiements de salaires automatiques
 * Appelé par cron toutes les 24h
 */
export async function processDailySalaries(): Promise<ActionResult> {
  try {
    const activeEmployments = await prisma.employment.findMany({
      where: { status: 'ACTIVE' },
      include: {
        company: { include: { capitalAccount: true } },
        employee: true,
      },
    })
    
    const results = await Promise.all(
      activeEmployments.map(async (employment) => {
        try {
          // Vérifier si le dernier paiement date d'au moins 24h
          const lastPaid = employment.lastPaidAt || employment.startedAt
          const hoursSinceLastPay = (Date.now() - lastPaid.getTime()) / (1000 * 60 * 60)
          
          if (hoursSinceLastPay < 24) {
            return { employmentId: employment.id, status: 'skipped', reason: 'Déjà payé aujourd\'hui' }
          }
          
          await prisma.$transaction(async (tx) => {
            const companyAccount = await tx.bankAccount.findUnique({
              where: { id: employment.company.capitalAccountId },
            })
            
            const employeeAccount = await tx.bankAccount.findFirst({
              where: { ownerId: employment.employeeId, ownerType: 'PERSONAL' },
            })
            
            if (!companyAccount || !employeeAccount) {
              throw new Error('Comptes introuvables')
            }
            
            // Vérifier le solde
            if (companyAccount.balance < employment.salaryPerDay) {
              throw new Error('Solde entreprise insuffisant')
            }
            
            // Effectuer le paiement
            await tx.bankAccount.update({
              where: { id: companyAccount.id },
              data: { balance: { decrement: employment.salaryPerDay } },
            })
            
            await tx.bankAccount.update({
              where: { id: employeeAccount.id },
              data: { balance: { increment: employment.salaryPerDay } },
            })
            
            await tx.salaryPayment.create({
              data: {
                employmentId: employment.id,
                amount: employment.salaryPerDay,
                daysPaid: 1,
              },
            })
            
            await tx.employment.update({
              where: { id: employment.id },
              data: { lastPaidAt: new Date() },
            })
          })
          
          return { employmentId: employment.id, status: 'paid' }
        } catch (error: any) {
          // Si 3 jours consécutifs sans paiement, terminer l'emploi
          const lastPaid = employment.lastPaidAt || employment.startedAt
          const daysSinceLastPay = Math.floor((Date.now() - lastPaid.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysSinceLastPay >= 3) {
            await prisma.employment.update({
              where: { id: employment.id },
              data: {
                status: 'TERMINATED',
                terminatedAt: new Date(),
                terminationReason: '3 jours sans paiement',
              },
            })
            return { employmentId: employment.id, status: 'terminated', reason: '3 jours sans paiement' }
          }
          
          return { employmentId: employment.id, status: 'failed', reason: error.message }
        }
      })
    )
    
    return { success: true, data: results }
  } catch (error: any) {
    console.error('Process salaries error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// RÉCUPÉRATION DE DONNÉES
// ============================================

/**
 * Récupère l'emploi actif d'un utilisateur
 */
export async function getUserEmployment(userId: string): Promise<ActionResult<EmploymentWithDetails | null>> {
  try {
    const employment = await prisma.employment.findFirst({
      where: {
        employeeId: userId,
        status: 'ACTIVE',
      },
      include: {
        employee: { select: { id: true, username: true, displayName: true } },
        company: { select: { id: true, name: true } },
        jobPosting: {
          include: { skillCategory: { select: { name: true } } },
        },
      },
    })
    
    if (!employment) {
      return { success: true, data: null }
    }
    
    return { success: true, data: employment }
  } catch (error) {
    console.error('Get user employment error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère tous les employés d'une entreprise
 */
export async function getCompanyEmployees(companyId: string): Promise<ActionResult<EmploymentWithDetails[]>> {
  try {
    const employees = await prisma.employment.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
      },
      include: {
        employee: { select: { id: true, username: true, displayName: true } },
        company: { select: { id: true, name: true } },
        jobPosting: {
          include: { skillCategory: { select: { name: true } } },
        },
      },
      orderBy: { startedAt: 'desc' },
    })
    
    return { success: true, data: employees }
  } catch (error) {
    console.error('Get company employees error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère les offres d'emploi d'une entreprise
 */
export async function getCompanyJobPostings(companyId: string): Promise<ActionResult<JobWithDetails[]>> {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: { companyId },
      include: {
        skillCategory: true,
        company: { select: { id: true, name: true } },
        applications: {
          where: { status: 'ACTIVE' },
          select: { id: true, employeeId: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return { success: true, data: jobs }
  } catch (error) {
    console.error('Get company jobs error:', error)
    return { success: false, error: 'Erreur' }
  }
}

/**
 * Récupère l'historique des paiements
 */
export async function getSalaryHistory(employmentId: string) {
  try {
    const payments = await prisma.salaryPayment.findMany({
      where: { employmentId },
      orderBy: { paidAt: 'desc' },
    })
    
    return { success: true, data: payments }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
