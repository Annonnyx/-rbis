// ============================================
// prisma/seed.ts
// Données initiales Ørbis - Idempotent
// ============================================

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Données des localisations de départ
 * Coordonnées approximatives pour le lore
 */
const LOCATIONS = [
  {
    name: 'Nova',
    lat: 48.8566,
    lng: 2.3522,
    unlocked: true,
    requiredUsersToUnlock: 0,
  },
  {
    name: 'Astra',
    lat: 40.7128,  // New York
    lng: -74.0060,
    unlocked: false,
    requiredUsersToUnlock: 100,
  },
  {
    name: 'Forge',
    lat: 35.6762,  // Tokyo
    lng: 139.6503,
    unlocked: false,
    requiredUsersToUnlock: 500,
  },
  {
    name: 'Apex',
    lat: -33.8688, // Sydney
    lng: 151.2093,
    unlocked: false,
    requiredUsersToUnlock: 1000,
  },
]

/**
 * Catégories de compétences pour le système d'emploi
 */
const SKILL_CATEGORIES = [
  { name: 'Production', icon: '⚙️' },
  { name: 'Commerce', icon: '🛒' },
  { name: 'Finance', icon: '💰' },
  { name: 'Logistique', icon: '🚚' },
  { name: 'Management', icon: '👥' },
  { name: 'Innovation', icon: '💡' },
]

/**
 * Fonction principale de seed
 * Idempotent - peut être relancée sans erreur
 */
async function main() {
  console.log('🌱 Starting seed...')

  // Seed MapLocations
  for (const location of LOCATIONS) {
    await prisma.mapLocation.upsert({
      where: { name: location.name },
      update: {
        lat: location.lat,
        lng: location.lng,
        unlocked: location.unlocked,
        requiredUsersToUnlock: location.requiredUsersToUnlock,
      },
      create: {
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        unlocked: location.unlocked,
        requiredUsersToUnlock: location.requiredUsersToUnlock,
      },
    })
    console.log(`  ✓ Location: ${location.name}`)
  }

  // Seed SkillCategories
  for (const skill of SKILL_CATEGORIES) {
    await prisma.skillCategory.upsert({
      where: { name: skill.name },
      update: {
        icon: skill.icon,
      },
      create: {
        name: skill.name,
        icon: skill.icon,
      },
    })
    console.log(`  ✓ Skill: ${skill.name}`)
  }

  console.log('✅ Seed completed successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
