// ============================================
// lib/skills.ts
// Gestion des compétences et du système XP
// ============================================

import { prisma } from './prisma'

/**
 * XP requis pour chaque niveau
 * Level 1: 0 XP (début)
 * Level 2: 100 XP
 * Level 3: 200 XP
 * Level 4: 300 XP
 * Level 5: 400 XP
 */
export const XP_PER_LEVEL = 100
export const MAX_LEVEL = 5

/**
 * Calcule le niveau à partir de l'XP total
 */
export function calculateLevel(experience: number): number {
  const level = Math.floor(experience / XP_PER_LEVEL) + 1
  return Math.min(level, MAX_LEVEL)
}

/**
 * Calcule l'XP nécessaire pour atteindre le prochain niveau
 */
export function xpToNextLevel(experience: number): number {
  const currentLevel = calculateLevel(experience)
  if (currentLevel >= MAX_LEVEL) return 0
  
  const nextLevelThreshold = currentLevel * XP_PER_LEVEL
  return nextLevelThreshold - experience
}

/**
 * Calcule la progression en pourcentage vers le prochain niveau
 */
export function levelProgressPercentage(experience: number): number {
  const currentLevel = calculateLevel(experience)
  if (currentLevel >= MAX_LEVEL) return 100
  
  const currentLevelThreshold = (currentLevel - 1) * XP_PER_LEVEL
  const nextLevelThreshold = currentLevel * XP_PER_LEVEL
  const xpInCurrentLevel = experience - currentLevelThreshold
  
  return Math.min(100, (xpInCurrentLevel / XP_PER_LEVEL) * 100)
}

/**
 * XP attribué pour différentes actions
 */
export const XP_REWARDS = {
  CREATE_COMPANY: 50,        // XP Commerce
  COMPLETE_TRANSACTION: 10,  // XP Finance
  PRODUCTION_DAY: 20,        // XP Production
  BUY_SHARES: 15,            // XP Finance
  LIST_ON_MARKET: 100,       // XP Commerce
  HIRE_EMPLOYEE: 75,         // XP Management
  COMPLETE_CONTRACT: 30,     // XP Logistique
  SUBMIT_SUGGESTION: 10,     // XP Innovation
} as const

/**
 * Attribue de l'XP à un utilisateur dans une catégorie
 * Crée le UserSkill s'il n'existe pas
 */
export async function awardExperience(
  userId: string,
  skillCategoryName: string,
  xpAmount: number
): Promise<void> {
  try {
    // Récupérer ou créer la catégorie
    let skillCategory = await prisma.skillCategory.findUnique({
      where: { name: skillCategoryName },
    })
    
    if (!skillCategory) {
      skillCategory = await prisma.skillCategory.create({
        data: {
          name: skillCategoryName,
          icon: '⭐',
        },
      })
    }
    
    // Récupérer le UserSkill actuel
    const userSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillCategoryId: {
          userId,
          skillCategoryId: skillCategory.id,
        },
      },
    })
    
    if (userSkill) {
      // Mettre à jour l'XP existant
      const newExperience = userSkill.experience + xpAmount
      const newLevel = calculateLevel(newExperience)
      
      await prisma.userSkill.update({
        where: { id: userSkill.id },
        data: {
          experience: newExperience,
          level: newLevel,
        },
      })
    } else {
      // Créer un nouveau UserSkill
      const initialLevel = calculateLevel(xpAmount)
      
      await prisma.userSkill.create({
        data: {
          userId,
          skillCategoryId: skillCategory.id,
          experience: xpAmount,
          level: initialLevel,
        },
      })
    }
  } catch (error) {
    console.error('Error awarding experience:', error)
  }
}

/**
 * Récupère toutes les compétences d'un utilisateur
 */
export async function getUserSkills(userId: string) {
  const skills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skillCategory: true },
    orderBy: { level: 'desc' },
  })
  
  return skills.map(skill => ({
    id: skill.id,
    name: skill.skillCategory.name,
    icon: skill.skillCategory.icon,
    level: skill.level,
    experience: skill.experience,
    progress: levelProgressPercentage(skill.experience),
    xpToNext: xpToNextLevel(skill.experience),
  }))
}

/**
 * Initialise les compétences pour un nouvel utilisateur
 * Toutes les compétences commencent au niveau 1 avec 0 XP
 */
export async function initializeUserSkills(userId: string): Promise<void> {
  const categories = await prisma.skillCategory.findMany()
  
  for (const category of categories) {
    const existing = await prisma.userSkill.findUnique({
      where: {
        userId_skillCategoryId: {
          userId,
          skillCategoryId: category.id,
        },
      },
    })
    
    if (!existing) {
      await prisma.userSkill.create({
        data: {
          userId,
          skillCategoryId: category.id,
          level: 1,
          experience: 0,
        },
      })
    }
  }
}

/**
 * Vérifie si un utilisateur a le niveau requis dans une compétence
 */
export async function hasRequiredSkillLevel(
  userId: string,
  skillCategoryId: string,
  requiredLevel: number
): Promise<boolean> {
  const userSkill = await prisma.userSkill.findUnique({
    where: {
      userId_skillCategoryId: {
        userId,
        skillCategoryId,
      },
    },
  })
  
  return (userSkill?.level || 1) >= requiredLevel
}
