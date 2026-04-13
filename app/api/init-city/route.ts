import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const existingCities = await db.city.count()
    
    if (existingCities > 0) {
      return NextResponse.json({ message: "Cities already initialized" })
    }

    await db.city.createMany({
      data: [
        {
          name: "Neo Paris",
          nameEn: "Neo Paris",
          nameFr: "Neo Paris",
          nameDe: "Neo Paris",
          nameEs: "Neo París",
          lat: 48.8566,
          lng: 2.3522,
          isUnlocked: true,
          unlockThreshold: 0,
        },
        {
          name: "Neo Tokyo",
          nameEn: "Neo Tokyo",
          nameFr: "Neo Tokyo",
          nameDe: "Neo Tokio",
          nameEs: "Neo Tokio",
          lat: 35.6762,
          lng: 139.6503,
          isUnlocked: false,
          unlockThreshold: 100,
        },
        {
          name: "Neo York",
          nameEn: "Neo York",
          nameFr: "Neo York",
          nameDe: "Neo York",
          nameEs: "Neo York",
          lat: 40.7128,
          lng: -74.0060,
          isUnlocked: false,
          unlockThreshold: 250,
        },
        {
          name: "Neo London",
          nameEn: "Neo London",
          nameFr: "Neo Londres",
          nameDe: "Neo London",
          nameEs: "Neo Londres",
          lat: 51.5074,
          lng: -0.1278,
          isUnlocked: false,
          unlockThreshold: 500,
        },
      ],
    })

    return NextResponse.json({ message: "Cities initialized successfully" })
  } catch (error) {
    console.error("Error initializing cities:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
