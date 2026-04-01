import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create starting city (Nova)
  const nova = await prisma.mapLocation.create({
    data: {
      name: 'Nova (ville de départ)',
      lat: 48.8566,
      lng: 2.3522,
      unlocked: true,
      requiredUsersToUnlock: 0,
    },
  })
  console.log('Created location:', nova.name)

  // Create other locked locations
  const locations = [
    { name: 'Aurora', lat: 51.5074, lng: -0.1278, requiredUsersToUnlock: 100 },
    { name: 'Solara', lat: 40.7128, lng: -74.0060, requiredUsersToUnlock: 500 },
    { name: 'Lunaris', lat: 35.6762, lng: 139.6503, requiredUsersToUnlock: 1000 },
  ]

  for (const location of locations) {
    const created = await prisma.mapLocation.create({
      data: {
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        unlocked: false,
        requiredUsersToUnlock: location.requiredUsersToUnlock,
      },
    })
    console.log('Created location:', created.name, '- Unlocked at:', created.requiredUsersToUnlock, 'users')
  }

  console.log('Seeding finished.')
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
