// ============================================
// app/actions/governance.ts
// Server Actions pour gouvernance politique
// ============================================

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'
import type { Election, ElectionCandidate, CommunityLaw, TaxConfig } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface ElectionWithCandidates extends Election {
  candidates: (ElectionCandidate & {
    user: { id: string; username: string; displayName: string | null }
  })[]
  _count?: { votes: number }
}

export interface LawWithAuthor extends CommunityLaw {
  proposer: { id: string; username: string; displayName: string | null }
}

// ============================================
// ÉLECTIONS
// ============================================

/**
 * Crée une nouvelle élection (automatisé par cron normalement)
 */
export async function createElection(
  locationId: string,
  durationDays: number = 7
): Promise<ActionResult<{ electionId: string }>> {
  try {
    const endsAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    
    const election = await prisma.election.create({
      data: {
        locationId,
        endsAt,
      },
    })
    
    return { success: true, data: { electionId: election.id } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Se présenter comme candidat à une élection
 */
export async function registerCandidate(
  userId: string,
  electionId: string,
  manifesto: string
): Promise<ActionResult> {
  try {
    // Vérifier que l'élection est ouverte
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { location: true },
    })
    
    if (!election || election.status !== 'OPEN') {
      return { success: false, error: 'Élection fermée ou introuvable' }
    }
    
    // Vérifier que l'utilisateur réside dans cette ville
    const userProfile = await prisma.gameProfile.findUnique({
      where: { userId },
      select: { homeLocationId: true },
    })
    
    if (!userProfile || userProfile.homeLocationId !== election.locationId) {
      return { success: false, error: 'Vous devez résider dans cette ville pour vous présenter' }
    }
    
    // Validation manifesto
    const trimmedManifesto = manifesto.trim()
    if (!trimmedManifesto || trimmedManifesto.length > 1000) {
      return { success: false, error: 'Programme électoral invalide (max 1000 caractères)' }
    }
    
    // Créer la candidature
    await prisma.electionCandidate.create({
      data: {
        electionId,
        userId,
        manifesto: trimmedManifesto,
      },
    })
    
    revalidatePath(`/governance/${election.locationId}`)
    
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Vous êtes déjà candidat à cette élection' }
    }
    return { success: false, error: error.message }
  }
}

/**
 * Voter pour un candidat
 */
export async function voteInElection(
  voterId: string,
  electionId: string,
  candidateId: string
): Promise<ActionResult> {
  try {
    // Vérifier que l'élection est ouverte
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { location: true },
    })
    
    if (!election || election.status !== 'OPEN') {
      return { success: false, error: 'Élection fermée ou introuvable' }
    }
    
    // Vérifier que l'utilisateur réside dans cette ville
    const userProfile = await prisma.gameProfile.findUnique({
      where: { userId: voterId },
      select: { homeLocationId: true },
    })
    
    if (!userProfile || userProfile.homeLocationId !== election.locationId) {
      return { success: false, error: 'Vous devez résider dans cette ville pour voter' }
    }
    
    // Transaction: créer le vote et incrémenter le compteur
    await prisma.$transaction(async (tx) => {
      await tx.electionVote.create({
        data: {
          electionId,
          voterId,
          candidateId,
        },
      })
      
      await tx.electionCandidate.update({
        where: { id: candidateId },
        data: { votes: { increment: 1 } },
      })
    })
    
    revalidatePath(`/governance/${election.locationId}`)
    
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Vous avez déjà voté dans cette élection' }
    }
    return { success: false, error: error.message }
  }
}

/**
 * Clôture une élection et élit le gagnant
 */
export async function closeElection(electionId: string): Promise<ActionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Récupérer l'élection avec candidats
      const election = await tx.election.findUnique({
        where: { id: electionId },
        include: { candidates: true },
      })
      
      if (!election || election.status !== 'OPEN') {
        throw new Error('Élection invalide ou déjà fermée')
      }
      
      // Trouver le gagnant (plus de votes)
      const winner = election.candidates.reduce((prev, current) => 
        (prev.votes > current.votes) ? prev : current
      )
      
      if (!winner || winner.votes === 0) {
        // Pas de gagnant, annuler l'élection
        await tx.election.update({
          where: { id: electionId },
          data: { status: 'CANCELLED' },
        })
        return { cancelled: true }
      }
      
      // Mettre à jour l'élection
      await tx.election.update({
        where: { id: electionId },
        data: { 
          status: 'CLOSED',
          winnerId: winner.userId,
        },
      })
      
      // Supprimer le représentant actuel s'il existe
      await tx.cityRepresentative.deleteMany({
        where: { locationId: election.locationId },
      })
      
      // Créer le nouveau représentant (mandat 30 jours)
      const mandateEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await tx.cityRepresentative.create({
        data: {
          locationId: election.locationId,
          userId: winner.userId,
          mandateEndsAt,
        },
      })
      
      return { winnerId: winner.userId, votes: winner.votes }
    })
    
    revalidatePath('/governance')
    
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// TAXES
// ============================================

/**
 * Met à jour les taux de taxes (représentant seulement)
 */
export async function updateTaxRates(
  userId: string,
  locationId: string,
  rates: { transactionTaxRate?: number; productionTaxRate?: number }
): Promise<ActionResult> {
  try {
    // Vérifier que l'utilisateur est le représentant
    const representative = await prisma.cityRepresentative.findUnique({
      where: { locationId },
    })
    
    if (!representative || representative.userId !== userId) {
      return { success: false, error: 'Seul le représentant peut modifier les taxes' }
    }
    
    // Validation des taux (0% à 15% max)
    const transactionRate = rates.transactionTaxRate ?? 0
    const productionRate = rates.productionTaxRate ?? 0
    
    if (transactionRate < 0 || transactionRate > 0.15 || productionRate < 0 || productionRate > 0.15) {
      return { success: false, error: 'Les taux doivent être entre 0% et 15%' }
    }
    
    await prisma.taxConfig.upsert({
      where: { locationId },
      update: {
        transactionTaxRate: transactionRate,
        productionTaxRate: productionRate,
        lastUpdatedBy: userId,
      },
      create: {
        locationId,
        transactionTaxRate: transactionRate,
        productionTaxRate: productionRate,
        lastUpdatedBy: userId,
      },
    })
    
    revalidatePath(`/governance/${locationId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Récupère la config des taxes d'une ville
 */
export async function getTaxConfig(locationId: string): Promise<ActionResult<TaxConfig & { updatedBy: { username: string } }>> {
  try {
    const config = await prisma.taxConfig.findUnique({
      where: { locationId },
      include: { updatedBy: { select: { username: true } } },
    })
    
    if (!config) {
      return { success: true, data: {
        id: '',
        locationId,
        transactionTaxRate: 0,
        productionTaxRate: 0,
        lastUpdatedBy: '',
        updatedAt: new Date(),
        updatedBy: { username: 'Système' },
      } as any }
    }
    
    return { success: true, data: config }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

// ============================================
// LOIS COMMUNAUTAIRES
// ============================================

/**
 * Propose une nouvelle loi
 */
export async function proposeLaw(
  userId: string,
  locationId: string,
  data: { title: string; description: string }
): Promise<ActionResult<{ lawId: string }>> {
  try {
    // Vérifier que l'utilisateur réside dans cette ville
    const userProfile = await prisma.gameProfile.findUnique({
      where: { userId },
      select: { homeLocationId: true },
    })
    
    if (!userProfile || userProfile.homeLocationId !== locationId) {
      return { success: false, error: 'Vous devez résider dans cette ville pour proposer une loi' }
    }
    
    // Validation
    const title = data.title.trim()
    const description = data.description.trim()
    
    if (!title || title.length > 100) {
      return { success: false, error: 'Titre invalide (max 100 caractères)' }
    }
    
    if (!description || description.length > 2000) {
      return { success: false, error: 'Description invalide (max 2000 caractères)' }
    }
    
    const votingEndsAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h
    
    const law = await prisma.communityLaw.create({
      data: {
        locationId,
        proposedBy: userId,
        title,
        description,
        votingEndsAt,
      },
    })
    
    revalidatePath(`/governance/${locationId}`)
    
    return { success: true, data: { lawId: law.id } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Vote pour ou contre une loi
 */
export async function voteOnLaw(
  userId: string,
  lawId: string,
  vote: 'for' | 'against'
): Promise<ActionResult> {
  try {
    const law = await prisma.communityLaw.findUnique({
      where: { id: lawId },
    })
    
    if (!law || law.status !== 'PROPOSED') {
      return { success: false, error: 'Loi introuvable ou vote terminé' }
    }
    
    if (new Date() > law.votingEndsAt) {
      return { success: false, error: 'Le vote est terminé' }
    }
    
    await prisma.communityLaw.update({
      where: { id: lawId },
      data: {
        votesFor: vote === 'for' ? { increment: 1 } : undefined,
        votesAgainst: vote === 'against' ? { increment: 1 } : undefined,
      },
    })
    
    revalidatePath(`/governance/${law.locationId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Finalise le vote d'une loi (à appeler après 48h)
 */
export async function finalizeLaw(lawId: string): Promise<ActionResult> {
  try {
    const law = await prisma.communityLaw.findUnique({
      where: { id: lawId },
    })
    
    if (!law || law.status !== 'PROPOSED') {
      return { success: false, error: 'Loi invalide' }
    }
    
    // Majorité simple
    const status = law.votesFor > law.votesAgainst ? 'ACTIVE' : 'REJECTED'
    
    await prisma.communityLaw.update({
      where: { id: lawId },
      data: { status },
    })
    
    revalidatePath(`/governance/${law.locationId}`)
    
    return { success: true, data: { status } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================
// RÉCUPÉRATION
// ============================================

export async function getElections(locationId: string): Promise<ActionResult<ElectionWithCandidates[]>> {
  try {
    const elections = await prisma.election.findMany({
      where: { locationId },
      include: {
        candidates: {
          include: {
            user: { select: { id: true, username: true, displayName: true } },
          },
        },
        _count: { select: { votes: true } },
      },
      orderBy: { startedAt: 'desc' },
    })
    
    return { success: true, data: elections }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

export async function getCurrentRepresentative(locationId: string): Promise<ActionResult<{ 
  representative: CityRepresentative & { user: { id: string; username: string; displayName: string | null } } | null
}>> {
  try {
    const representative = await prisma.cityRepresentative.findUnique({
      where: { locationId },
      include: {
        user: { select: { id: true, username: true, displayName: true } },
      },
    })
    
    return { success: true, data: { representative } }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}

export async function getLaws(locationId: string): Promise<ActionResult<LawWithAuthor[]>> {
  try {
    const laws = await prisma.communityLaw.findMany({
      where: { locationId },
      include: {
        proposer: { select: { id: true, username: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return { success: true, data: laws }
  } catch (error) {
    return { success: false, error: 'Erreur' }
  }
}
