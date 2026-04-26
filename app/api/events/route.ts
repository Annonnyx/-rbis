import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { EventType } from "@prisma/client"

// Event templates
const EVENT_TEMPLATES = {
  [EventType.OPPORTUNITY]: [
    {
      title: "Partenariat inattendu",
      description: "Un grand distributeur souhaite référencer vos produits",
      revenueImpact: 0.2,
      durationHours: 168, // 1 week
      choices: ["accept", "reject"]
    },
    {
      title: "Innovation réussie",
      description: "Votre équipe R&D a découvert un procédé révolutionnaire",
      revenueImpact: 0.3,
      durationHours: 720, // 1 month
      choices: ["implement", "sell"]
    }
  ],
  [EventType.BREAKDOWN]: [
    {
      title: "Panne équipement",
      description: "Une machine critique est tombée en panne",
      revenueImpact: -0.1,
      durationHours: 72, // 3 days
      choices: ["repair", "replace"]
    },
    {
      title: "Pénurie matière première",
      description: "Fournisseur principal en rupture de stock",
      revenueImpact: -0.15,
      durationHours: 120, // 5 days
      choices: ["wait", "find_alternative"]
    }
  ],
  [EventType.BUZZ]: [
    {
      title: "Collection virale",
      description: "Votre produit est devenu tendance sur les réseaux",
      revenueImpact: 0.5,
      durationHours: 336, // 2 weeks
      choices: ["capitalize", "ignore"]
    }
  ],
  [EventType.CRISIS]: [
    {
      title: "Crise économique",
      description: "Le marché est en baisse, les consommateurs réduisent leurs dépenses",
      revenueImpact: -0.3,
      durationHours: 720, // 1 month
      choices: ["cut_costs", "invest_marketing"]
    }
  ],
  [EventType.SCANDAL]: [
    {
      title: "Rumeur négative",
      description: "Des rumeurs circulent sur vos pratiques commerciales",
      reputationImpact: -30,
      choices: ["deny", "apologize", "investigate"]
    }
  ]
}

// GET /api/events - Get user's active events
export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const events = await db.randomEvent.findMany({
      where: { 
        userId: session.user.id,
        isActive: true
      },
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/events/generate - Generate random event
export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { businessId } = await req.json()

    // Get user's business if provided
    let business = null
    if (businessId) {
      business = await db.business.findUnique({
        where: { id: businessId }
      })
    }

    // Random event type selection
    const eventTypes = Object.values(EventType)
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    const templates = EVENT_TEMPLATES[randomType as EventType]
    const template = templates[Math.floor(Math.random() * templates.length)]

    // Create event
    const event = await db.randomEvent.create({
      data: {
        userId: session.user.id,
        businessId: businessId || null,
        type: randomType,
        title: template.title,
        description: template.description,
        revenueImpact: (template as any).revenueImpact,
        reputationImpact: (template as any).reputationImpact,
        durationHours: (template as any).durationHours,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      event,
      message: `Événement généré: ${template.title}`
    })

  } catch (error) {
    console.error("Error generating event:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PUT /api/events/resolve - Resolve event with player choice
export async function PUT(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { eventId, choice } = await req.json()
    
    if (!eventId || !choice) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get event
    const event = await db.randomEvent.findUnique({
      where: { id: eventId }
    })

    if (!event || event.userId !== session.user.id) {
      return new NextResponse("Event not found", { status: 404 })
    }

    // Calculate result based on choice
    let result = "neutral"
    let finalImpact = Number(event.revenueImpact) || 0

    if (choice === "accept" || choice === "implement" || choice === "capitalize") {
      result = "positive"
      finalImpact = finalImpact * 1.2 // Boost positive impact
    } else if (choice === "reject" || choice === "ignore") {
      result = "missed"
      finalImpact = 0 // No impact
    } else if (choice === "repair" || choice === "invest_marketing" || choice === "apologize") {
      result = "mitigated"
      finalImpact = finalImpact * 0.5 // Reduce negative impact
    }

    // Update event
    const updatedEvent = await db.randomEvent.update({
      where: { id: eventId },
      data: {
        playerChoice: choice,
        choiceResult: result,
        revenueImpact: finalImpact,
        isActive: false,
        resolvedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: `Événement résolu: ${result}`
    })

  } catch (error) {
    console.error("Error resolving event:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
