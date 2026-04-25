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

    const sales = await db.sale.findMany({
      where: { businessId: business.id },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedSales = sales.map(sale => ({
      ...sale,
      productName: sale.product.name,
    }))

    return NextResponse.json(formattedSales)
  } catch (error) {
    console.error("Error fetching sales:", error)
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

    const { productId, quantity, buyerName } = await req.json()

    const product = await db.product.findFirst({
      where: { id: productId, businessId: business.id },
    })

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    if (product.stock < quantity) {
      return new NextResponse("Insufficient stock", { status: 400 })
    }

    const totalAmount = Number(product.price) * quantity

    const [sale] = await db.$transaction([
      db.sale.create({
        data: {
          productId,
          businessId: business.id,
          quantity,
          unitPrice: product.price,
          totalAmount,
          buyerName,
        },
      }),
      db.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      }),
      db.business.update({
        where: { id: business.id },
        data: { capital: { increment: totalAmount } },
      }),
    ])

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error recording sale:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
