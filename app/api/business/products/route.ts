import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const business = await db.business.findFirst({
      where: { userId: session.user.id },
    })

    if (!business) {
      return NextResponse.json([])
    }

    const products = await db.product.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const business = await db.business.findFirst({
      where: { userId: session.user.id },
    })

    if (!business) {
      return new NextResponse("Business not found", { status: 404 })
    }

    const { name, description, price, stock } = await req.json()

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        stock,
        businessId: business.id,
        isActive: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
