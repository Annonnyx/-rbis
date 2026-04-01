// ============================================
// app/api/locations/route.ts
// API endpoint pour récupérer les locations
// ============================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const locations = await prisma.mapLocation.findMany({
      orderBy: { requiredUsersToUnlock: 'asc' },
    })
    
    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
