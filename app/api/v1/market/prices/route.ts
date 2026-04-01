// ============================================
// app/api/v1/market/prices/route.ts
// Prix actuels des ressources
// ============================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prices = await prisma.resourceType.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        basePrice: true,
        unit: true,
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json({
      data: prices,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Orbis-Version': '1.0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}
