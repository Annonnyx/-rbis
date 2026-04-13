import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  try {
    const suggestions = await db.suggestion.findMany({
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
      },
      orderBy: [
        { votes: "desc" },
        { createdAt: "desc" },
      ],
    })

    const userId = session?.user?.id

    const formattedSuggestions = suggestions.map((suggestion: any) => ({
      ...suggestion,
      hasVoted: userId 
        ? suggestion.votesList.some((v: any) => v.userId === userId)
        : false,
    }))

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
