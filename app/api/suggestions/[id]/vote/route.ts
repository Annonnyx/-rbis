import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const userId = session.user.id
  const { id: suggestionId } = await params

  try {
    const existingVote = await db.vote.findUnique({
      where: {
        userId_suggestionId: {
          userId,
          suggestionId,
        },
      },
    })

    if (existingVote) {
      await db.$transaction([
        db.vote.delete({
          where: { id: existingVote.id },
        }),
        db.suggestion.update({
          where: { id: suggestionId },
          data: { votes: { decrement: 1 } },
        }),
      ])
      return NextResponse.json({ voted: false })
    } else {
      await db.$transaction([
        db.vote.create({
          data: {
            userId,
            suggestionId,
          },
        }),
        db.suggestion.update({
          where: { id: suggestionId },
          data: { votes: { increment: 1 } },
        }),
      ])
      return NextResponse.json({ voted: true })
    }
  } catch (error) {
    console.error("Error voting:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
