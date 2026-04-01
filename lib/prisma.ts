// ============================================
// lib/prisma.ts
// Singleton Prisma Client pour Next.js
// Pattern standard pour éviter les connexions multiples en dev
// ============================================

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Instance singleton du client Prisma
 * Réutilise l'instance en développement pour éviter les warnings
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
