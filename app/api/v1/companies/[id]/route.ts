// ============================================
// app/api/v1/companies/[id]/route.ts
// Détail d'une entreprise
// ============================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        objective: true,
        description: true,
        createdAt: true,
        location: { select: { name: true } },
        owner: { select: { username: true } },
        shareInfo: { select: { isListed: true, currentPrice: true } },
      },
    })
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(company, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Orbis-Version': '1.0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}
