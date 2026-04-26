#!/usr/bin/env node
/**
 * Script to seed initial game locations
 * Run with: npx ts-node scripts/seed-locations.ts
 */

import { PrismaClient, LocationType } from "@prisma/client"

const prisma = new PrismaClient()

const initialLocations = [
  // Paris - Centre
  { name: "Rue de Rivoli - Boutique 1", address: "125 Rue de Rivoli, Paris", lat: 48.8566, lng: 2.3522, type: LocationType.COMMERCIAL, district: "Paris 1er", rentPerSqm: 150, footTraffic: 95, visibility: 90, accessibility: 95 },
  { name: "Avenue des Champs-Élysées", address: " Avenue des Champs-Élysées, Paris", lat: 48.8698, lng: 2.3078, type: LocationType.COMMERCIAL, district: "Paris 8ème", rentPerSqm: 200, footTraffic: 90, visibility: 95, accessibility: 90 },
  { name: "La Défense - Tour Espace", address: "15 Place de la Défense, Puteaux", lat: 48.8925, lng: 2.2369, type: LocationType.FINANCIAL, district: "La Défense", rentPerSqm: 120, footTraffic: 80, visibility: 85, accessibility: 90 },
  { name: "Bastille - Local Commercial", address: "12 Boulevard Beaumarchais, Paris", lat: 48.8530, lng: 2.3691, type: LocationType.COMMERCIAL, district: "Paris 11ème", rentPerSqm: 100, footTraffic: 75, visibility: 70, accessibility: 85 },
  { name: "Porte de Versailles - Entrepôt", address: "1 Place de la Porte de Versailles, Paris", lat: 48.8323, lng: 2.2876, type: LocationType.INDUSTRIAL, district: "Paris 15ème", rentPerSqm: 40, footTraffic: 30, visibility: 40, accessibility: 70, hasLoadingDock: true, hasStorage: true },
  
  // Paris - Aéroport
  { name: "Roissy-Charles de Gaulle - Terminal", address: "95700 Roissy-en-France", lat: 49.0097, lng: 2.5479, type: LocationType.AIRPORT, district: "Roissy", rentPerSqm: 180, footTraffic: 85, visibility: 80, accessibility: 95 },
  
  // Lyon
  { name: "Presqu'île - Local Premium", address: "Place Bellecour, Lyon", lat: 45.7578, lng: 4.8320, type: LocationType.COMMERCIAL, district: "Lyon Centre", rentPerSqm: 110, footTraffic: 85, visibility: 85, accessibility: 90 },
  { name: "Vaise - Zone Industrielle", address: "Quartier de Vaise, Lyon", lat: 45.7700, lng: 4.8000, type: LocationType.INDUSTRIAL, district: "Lyon 9ème", rentPerSqm: 35, footTraffic: 25, visibility: 35, accessibility: 60, hasLoadingDock: true },
  
  // Marseille
  { name: "Vieux-Port - Commerce", address: "Quai des Belges, Marseille", lat: 43.2965, lng: 5.3698, type: LocationType.TOURIST, district: "Marseille Centre", rentPerSqm: 95, footTraffic: 80, visibility: 85, accessibility: 75 },
  { name: "Grand Littoral - Zone Portuaire", address: "Port de Marseille", lat: 43.3500, lng: 5.3500, type: LocationType.PORT, district: "Marseille Port", rentPerSqm: 55, footTraffic: 40, visibility: 50, accessibility: 70, hasLoadingDock: true },
  
  // Bordeaux
  { name: "Place de la Bourse", address: "Place de la Bourse, Bordeaux", lat: 44.8420, lng: -0.5700, type: LocationType.COMMERCIAL, district: "Bordeaux Centre", rentPerSqm: 105, footTraffic: 80, visibility: 85, accessibility: 85 },
  
  // Lille
  { name: "Grand Place - Commerce", address: "Grand Place, Lille", lat: 50.6292, lng: 3.0573, type: LocationType.COMMERCIAL, district: "Lille Centre", rentPerSqm: 85, footTraffic: 75, visibility: 80, accessibility: 80 },
  
  // Nantes
  { name: "Passage Pommeraye - Boutique", address: "Passage Pommeraye, Nantes", lat: 47.2133, lng: -1.5592, type: LocationType.COMMERCIAL, district: "Nantes Centre", rentPerSqm: 80, footTraffic: 70, visibility: 75, accessibility: 75 },
  
  // Village rural (pour stratégie usine)
  { name: "Saint-Just-en-Chaussée - Terrain", address: "Rue Principale, Saint-Just", lat: 49.5060, lng: 2.4310, type: LocationType.RURAL, district: "Saint-Just-en-Chaussée", rentPerSqm: 5, footTraffic: 10, visibility: 15, accessibility: 30 },
  { name: "Villeneuve-sur-Lot - Local", address: "Centre bourg, Villeneuve", lat: 44.4000, lng: 0.7167, type: LocationType.RURAL, district: "Villeneuve-sur-Lot", rentPerSqm: 6, footTraffic: 12, visibility: 18, accessibility: 35 }
]

async function main() {
  console.log("🌱 Seeding game locations...")
  
  let created = 0
  let skipped = 0
  
  for (const loc of initialLocations) {
    const existing = await prisma.gameLocation.findFirst({
      where: { 
        lat: loc.lat, 
        lng: loc.lng,
        name: loc.name 
      }
    })
    
    if (!existing) {
      await prisma.gameLocation.create({ data: loc })
      created++
      console.log(`✅ Created: ${loc.name}`)
    } else {
      skipped++
      console.log(`⏭️  Skipped (exists): ${loc.name}`)
    }
  }
  
  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`)
  console.log(`📍 Total locations in database: ${await prisma.gameLocation.count()}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
