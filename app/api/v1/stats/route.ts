// ============================================
// app/api/v1/stats/route.ts
// Statistiques globales du monde
// ============================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalTransactions,
      totalOrbes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.transaction.count(),
      prisma.bankAccount.aggregate({ _sum: { balance: true } }),
    ])
    
    // Format response
    const stats = {
      totalUsers,
      totalCompanies,
      totalTransactions,
      totalOrbesCirculating: totalOrbes._sum.balance?.toString() || '0',
      activeEvents: [], // TODO: Add events logic
      timestamp: new Date().toISOString(),
    }
    
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Orbis-Version': '1.0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
