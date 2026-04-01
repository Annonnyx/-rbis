'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function submitSuggestion(userId: string, title: string, description: string) {
  try {
    const suggestion = await prisma.suggestion.create({
      data: {
        authorId: userId,
        title,
        description,
        status: 'PENDING',
        upvotes: 0,
      },
    })

    revalidatePath('/suggestions')
    return { success: true, suggestionId: suggestion.id }
  } catch (error) {
    console.error('Submit suggestion error:', error)
    return { error: 'Erreur lors de la création de la suggestion' }
  }
}

export async function getSuggestions(
  status?: string,
  sortBy: 'recent' | 'votes' = 'recent',
  page: number = 1,
  pageSize: number = 20
) {
  try {
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    const orderBy: any = sortBy === 'votes' 
      ? { upvotes: 'desc' }
      : { createdAt: 'desc' }

    const [suggestions, totalCount] = await Promise.all([
      prisma.suggestion.findMany({
        where,
        include: {
          author: {
            select: {
              username: true,
              displayName: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.suggestion.count({ where }),
    ])

    return {
      suggestions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    }
  } catch (error) {
    console.error('Get suggestions error:', error)
    return { error: 'Erreur lors de la récupération des suggestions' }
  }
}

export async function getSuggestionsWithVotes(userId: string, status?: string, sortBy: 'recent' | 'votes' = 'recent') {
  try {
    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    const orderBy: any = sortBy === 'votes' 
      ? { upvotes: 'desc' }
      : { createdAt: 'desc' }

    const suggestions = await prisma.suggestion.findMany({
      where,
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
          },
        },
        votes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy,
    })

    // Add hasVoted field to each suggestion
    const suggestionsWithVoteStatus = suggestions.map(s => ({
      ...s,
      hasVoted: s.votes.length > 0,
      votes: undefined, // Remove votes array from response
    }))

    return { suggestions: suggestionsWithVoteStatus }
  } catch (error) {
    console.error('Get suggestions with votes error:', error)
    return { error: 'Erreur lors de la récupération des suggestions' }
  }
}

export async function voteSuggestion(userId: string, suggestionId: string) {
  try {
    // Check if user already voted
    const existingVote = await prisma.suggestionVote.findUnique({
      where: {
        userId_suggestionId: {
          userId,
          suggestionId,
        },
      },
    })

    if (existingVote) {
      return { error: 'Vous avez déjà voté pour cette suggestion' }
    }

    // Create vote and increment upvotes
    await prisma.$transaction(async (tx) => {
      await tx.suggestionVote.create({
        data: {
          userId,
          suggestionId,
        },
      })

      await tx.suggestion.update({
        where: { id: suggestionId },
        data: { upvotes: { increment: 1 } },
      })
    })

    revalidatePath('/suggestions')
    return { success: true }
  } catch (error) {
    console.error('Vote suggestion error:', error)
    return { error: 'Erreur lors du vote' }
  }
}

export async function getRecentSuggestions(limit: number = 3) {
  try {
    const suggestions = await prisma.suggestion.findMany({
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return { suggestions }
  } catch (error) {
    console.error('Get recent suggestions error:', error)
    return { error: 'Erreur lors de la récupération des suggestions' }
  }
}
