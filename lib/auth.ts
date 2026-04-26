import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import { db } from "./db"
import NextAuth from "next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id = user.id
        session.user.identifier = user.identifier
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async createUser({ user }: { user: any }) {
      const identifier = `ORB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString(36).substring(4, 8).toUpperCase()}`
      
      await db.user.update({
        where: { id: user.id },
        data: { identifier },
      })

      await db.bankAccount.create({
        data: {
          userId: user.id,
          type: "PERSONAL",
          name: "Compte Principal",
          balance: 1000,
          currency: "\u00D8",
          isMain: true,
        },
      })

      const defaultCity = await db.city.findFirst({
        where: { isUnlocked: true },
        orderBy: { createdAt: "asc" },
      })

      if (defaultCity) {
        await db.userLocation.create({
          data: {
            userId: user.id,
            lat: defaultCity.lat,
            lng: defaultCity.lng,
            cityId: defaultCity.id,
          },
        })
      }
    },
  },
})
