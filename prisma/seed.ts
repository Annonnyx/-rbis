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
 * Types de ressources pour le système de production
 */
const RESOURCE_TYPES = [
  { name: 'Savon', category: 'PROCESSED', basePrice: 500, unit: 'unité' },
  { name: 'Pain', category: 'PROCESSED', basePrice: 300, unit: 'unité' },
  { name: 'Vêtements', category: 'PROCESSED', basePrice: 2000, unit: 'unité' },
  { name: 'Électricité', category: 'ENERGY', basePrice: 100, unit: 'kWh' },
  { name: 'Eau', category: 'RAW', basePrice: 50, unit: 'litre' },
  { name: 'Métal', category: 'RAW', basePrice: 800, unit: 'kg' },
  { name: 'Bois', category: 'RAW', basePrice: 400, unit: 'kg' },
  { name: 'Pétrole', category: 'RAW', basePrice: 1500, unit: 'baril' },
  { name: 'Données', category: 'SERVICE', basePrice: 1000, unit: 'GB' },
]

/**
 * Quêtes du jeu
 */
const QUEST_TEMPLATES = [
  // PERMANENTES
  { title: 'Premier virement', description: 'Effectuer votre première transaction bancaire', type: 'PERMANENT', category: 'ECONOMY', requirement: { type: 'transaction_count', target: 1 }, rewardOrbes: 50, repeatable: false },
  { title: 'Entrepreneur', description: 'Créer votre première entreprise', type: 'PERMANENT', category: 'ECONOMY', requirement: { type: 'company_created', target: 1 }, rewardOrbes: 200, repeatable: false },
  { title: 'Actionnaire', description: 'Acheter des actions pour la première fois', type: 'PERMANENT', category: 'ECONOMY', requirement: { type: 'shares_bought', target: 1 }, rewardOrbes: 100, repeatable: false },
  { title: 'Citoyen engagé', description: 'Voter pour une suggestion', type: 'PERMANENT', category: 'SOCIAL', requirement: { type: 'suggestion_voted', target: 1 }, rewardOrbes: 30, repeatable: false },
  { title: 'Messager', description: 'Envoyer votre premier message privé', type: 'PERMANENT', category: 'SOCIAL', requirement: { type: 'message_sent', target: 1 }, rewardOrbes: 25, repeatable: false },
  
  // QUOTIDIENNES
  { title: 'Journée active', description: 'Effectuer 3 transactions', type: 'DAILY', category: 'ECONOMY', requirement: { type: 'transaction_count', target: 3 }, rewardOrbes: 30, repeatable: true },
  { title: 'Communicateur', description: 'Envoyer 5 messages', type: 'DAILY', category: 'SOCIAL', requirement: { type: 'message_sent', target: 5 }, rewardOrbes: 20, repeatable: true },
  { title: 'Voyageur', description: 'Explorer une ville différente', type: 'DAILY', category: 'EXPLORATION', requirement: { type: 'city_visited', target: 1 }, rewardOrbes: 15, repeatable: true },
  
  // HEBDOMADAIRES
  { title: 'Semaine productive', description: 'Compléter 5 cycles de production', type: 'WEEKLY', category: 'PRODUCTION', requirement: { type: 'production_cycles', target: 5 }, rewardOrbes: 150, repeatable: true },
  { title: 'Investisseur actif', description: 'Acheter 10 actions', type: 'WEEKLY', category: 'ECONOMY', requirement: { type: 'shares_bought', target: 10 }, rewardOrbes: 100, repeatable: true },
  { title: 'Gros virement', description: 'Transférer plus de 1000 Orbes', type: 'WEEKLY', category: 'ECONOMY', requirement: { type: 'orbes_transferred', target: 100000 }, rewardOrbes: 80, repeatable: true },
  { title: 'Ambassadeur', description: 'Envoyer 20 messages', type: 'WEEKLY', category: 'SOCIAL', requirement: { type: 'message_sent', target: 20 }, rewardOrbes: 75, repeatable: true },
  { title: 'Entrepreneur en série', description: 'Créer 2 entreprises', type: 'WEEKLY', category: 'ECONOMY', requirement: { type: 'company_created', target: 2 }, rewardOrbes: 120, repeatable: true },
]

/**
 * Réalisations / Badges
 */
const ACHIEVEMENTS = [
  // COMMON
  { title: 'Fondateur', description: 'Créer votre première entreprise', icon: '🏦', category: 'ECONOMY', rarity: 'COMMON', condition: { type: 'company_created', target: 1 } },
  { title: 'Votant', description: 'Voter 10 fois pour des suggestions', icon: '🗳️', category: 'SOCIAL', rarity: 'COMMON', condition: { type: 'suggestion_voted', target: 10 } },
  { title: 'Messager', description: 'Envoyer 50 messages', icon: '💬', category: 'SOCIAL', rarity: 'COMMON', condition: { type: 'message_sent', target: 50 } },
  { title: 'Commerçant', description: 'Effectuer 20 transactions', icon: '💸', category: 'ECONOMY', rarity: 'COMMON', condition: { type: 'transaction_count', target: 20 } },
  
  // RARE
  { title: 'Bull Market', description: 'Avoir un portfolio d\'actions > ◎ 10 000', icon: '📈', category: 'ECONOMY', rarity: 'RARE', condition: { type: 'portfolio_value', target: 1000000 } },
  { title: 'Producteur', description: 'Compléter 50 cycles de production', icon: '⚙️', category: 'ECONOMY', rarity: 'RARE', condition: { type: 'production_cycles', target: 50 } },
  { title: 'Politicien', description: 'Proposer 5 lois communautaires', icon: '🏛️', category: 'SOCIAL', rarity: 'RARE', condition: { type: 'law_proposed', target: 5 } },
  { title: 'Stratège', description: 'Gagner une élection', icon: '🗳️', category: 'SOCIAL', rarity: 'RARE', condition: { type: 'election_won', target: 1 } },
  
  // EPIC
  { title: 'Globetrotteur', description: 'Avoir une entreprise dans 3 villes', icon: '🌍', category: 'EXPLORER', rarity: 'EPIC', condition: { type: 'companies_in_cities', target: 3 } },
  { title: 'Magnat', description: 'Posséder 5 entreprises', icon: '🏭', category: 'ECONOMY', rarity: 'EPIC', condition: { type: 'company_created', target: 5 } },
  { title: 'Philanthrope', description: 'Voter 100 fois', icon: '🎁', category: 'SOCIAL', rarity: 'EPIC', condition: { type: 'suggestion_voted', target: 100 } },
  { title: 'Grand messager', description: 'Envoyer 500 messages', icon: '📨', category: 'SOCIAL', rarity: 'EPIC', condition: { type: 'message_sent', target: 500 } },
  
  // LEGENDARY
  { title: 'Représentant', description: 'Être élu représentant d\'une ville', icon: '👑', category: 'LEGEND', rarity: 'LEGENDARY', condition: { type: 'election_won', target: 1 } },
  { title: 'Milliardaire', description: 'Avoir un solde total > ◎ 1 000 000', icon: '⚡', category: 'ECONOMY', rarity: 'LEGENDARY', condition: { type: 'total_balance', target: 100000000 } },
  { title: 'Légende vivante', description: 'Débloquer toutes les réalisations', icon: '🌟', category: 'LEGEND', rarity: 'LEGENDARY', condition: { type: 'all_achievements', target: 1 } },
  { title: 'Maître du commerce', description: 'Effectuer 1000 transactions', icon: '💎', category: 'ECONOMY', rarity: 'LEGENDARY', condition: { type: 'transaction_count', target: 1000 } },
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

  // Seed ResourceTypes
  for (const resource of RESOURCE_TYPES) {
    await prisma.resourceType.upsert({
      where: { name: resource.name },
      update: {
        category: resource.category,
        basePrice: resource.basePrice,
        unit: resource.unit,
      },
      create: {
        name: resource.name,
        category: resource.category,
        basePrice: resource.basePrice,
        unit: resource.unit,
      },
    })
    console.log(`  ✓ Resource: ${resource.name}`)
  }

  // Seed TradeRoutes between locations (when multiple locations are unlocked)
  const locations = await prisma.mapLocation.findMany()
  if (locations.length >= 2) {
    console.log('🌱 Seeding TradeRoutes...')
    
    const tradeRoutes = [
      { from: locations[0], to: locations[1], distance: 100, transitTimeMins: 120 },
      ...(locations[2] ? [{ from: locations[0], to: locations[2], distance: 200, transitTimeMins: 240 }] : []),
      ...(locations[3] ? [{ from: locations[1], to: locations[3], distance: 150, transitTimeMins: 180 }] : []),
      ...(locations[2] && locations[3] ? [{ from: locations[2], to: locations[3], distance: 100, transitTimeMins: 120 }] : []),
    ]
    
    for (const route of tradeRoutes) {
      try {
        await prisma.tradeRoute.upsert({
          where: {
            fromLocationId_toLocationId: {
              fromLocationId: route.from.id,
              toLocationId: route.to.id,
            },
          },
          update: {
            distance: route.distance,
            transitTimeMins: route.transitTimeMins,
            active: true,
          },
          create: {
            fromLocationId: route.from.id,
            toLocationId: route.to.id,
            distance: route.distance,
            transitTimeMins: route.transitTimeMins,
            active: true,
          },
        })
        console.log(`  ✓ TradeRoute: ${route.from.name} ↔ ${route.to.name}`)
      } catch (error) {
        console.log(`  ⚠️ TradeRoute skipped: ${route.from.name} ↔ ${route.to.name}`)
      }
    }
  }

  // Seed QuestTemplates
  console.log('🌱 Seeding QuestTemplates...')
  for (const quest of QUEST_TEMPLATES) {
    await prisma.questTemplate.upsert({
      where: { title: quest.title },
      update: {
        description: quest.description,
        type: quest.type,
        category: quest.category,
        requirement: quest.requirement,
        rewardOrbes: quest.rewardOrbes,
        repeatable: quest.repeatable,
      },
      create: {
        title: quest.title,
        description: quest.description,
        type: quest.type,
        category: quest.category,
        requirement: quest.requirement,
        rewardOrbes: quest.rewardOrbes,
        repeatable: quest.repeatable,
      },
    })
    console.log(`  ✓ Quest: ${quest.title}`)
  }

  // Seed Achievements
  console.log('🌱 Seeding Achievements...')
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { title: achievement.title },
      update: {
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        condition: achievement.condition,
      },
      create: {
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        condition: achievement.condition,
      },
    })
    console.log(`  ✓ Achievement: ${achievement.title}`)
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
