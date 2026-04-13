"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { User } from "lucide-react"

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

export function ProfileClient() {
  const { data: session, status } = useSafeSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false)
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <User className="w-12 h-12 text-orbe animate-pulse" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Mon Profil</h1>
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-orbe/10 rounded-full">
            <User className="w-8 h-8 text-orbe" />
          </div>
          <div>
            <p className="font-semibold">{session?.user?.name}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
