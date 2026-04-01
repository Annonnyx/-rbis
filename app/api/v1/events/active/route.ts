// ============================================
// app/api/v1/events/active/route.ts
// Événements actifs
// ============================================

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // TODO: Implement events logic
    // For now, return empty array
    
    return NextResponse.json({
      data: [],
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Orbis-Version': '1.0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
