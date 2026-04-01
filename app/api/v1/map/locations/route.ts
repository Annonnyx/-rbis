// ============================================
// app/api/v1/map/locations/route.ts
// Localisations sur la carte
// ============================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const locations = await prisma.mapLocation.findMany({
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
        unlocked: true,
        requiredUsersToUnlock: true,
        _count: {
          select: {
            residents: true,
            companies: true,
          },
        },
      },
      orderBy: { requiredUsersToUnlock: 'asc' },
    })
    
    return NextResponse.json({
      data: locations,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Orbis-Version': '1.0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
