import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const sort = searchParams.get("sort") || "POPULAR"
  
  try {
    const where: any = {}
    if (type && type !== "ALL") {
      where.type = type
    }

    const orderBy = sort === "NEWEST" 
      ? { createdAt: "desc" as const }
      : [{ votes: "desc" as const }, { createdAt: "desc" as const }]

    const suggestions = await db.suggestion.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            identifier: true,
          },
        },
        votesList: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            votesList: true,
          },
        },
      },
      orderBy,
    })

    const userId = session?.user?.id

    const formattedSuggestions = suggestions.map((suggestion: any) => {
      const userVote = userId 
        ? suggestion.votesList.find((v: any) => v.userId === userId)
        : null
      
      return {
        ...suggestion,
        userVote: userVote ? "UP" : null,
        commentsCount: 0, // TODO: Add comments model
      }
    })

    return NextResponse.json(formattedSuggestions)
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { title, description, type } = await req.json()

    const suggestion = await db.suggestion.create({
      data: {
        userId: session.user.id,
        title,
        description,
        type,
        status: "PENDING",
        votes: 0,
      },
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error("Error creating suggestion:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
