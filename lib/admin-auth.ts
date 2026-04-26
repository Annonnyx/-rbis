import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function isAdmin() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return false
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  return user?.role === "ADMIN"
}

export async function isAdminOrModerator() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return false
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  return user?.role === "ADMIN" || user?.role === "MODERATOR"
}

export async function getCurrentUserRole() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  return user?.role || null
}
