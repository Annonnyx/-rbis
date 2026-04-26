import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const identifier = "ORB-5OIF-VOM1"
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { identifier },
      select: { id: true, name: true, email: true, role: true, identifier: true }
    })

    if (!user) {
      console.log(`❌ User with identifier ${identifier} not found`)
      process.exit(1)
    }

    console.log(`Found user: ${user.name || user.email} (${user.identifier})`)
    console.log(`Current role: ${user.role}`)

    // Update to admin
    const updatedUser = await prisma.user.update({
      where: { identifier },
      data: { role: "ADMIN" }
    })

    console.log(`✅ User ${updatedUser.identifier} is now ADMIN`)
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
