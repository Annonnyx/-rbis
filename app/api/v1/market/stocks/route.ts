// ============================================
// app/api/v1/market/stocks/route.ts
// Actions cotées avec prix
// ============================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stocks = await prisma.companyShare.findMany({
      where: { isListed: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            objective: true,
          },
        },
      },
      orderBy: { currentPrice: 'desc' },
    })
    
    return NextResponse.json({
      data: stocks,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Orbis-Version': '1.0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    )
  }
}
