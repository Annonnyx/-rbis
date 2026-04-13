"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

export function MapClient() {
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
        <MapPin className="w-12 h-12 text-orbe animate-pulse" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Carte</h1>
      <div className="glass rounded-2xl p-8 text-center min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Carte interactive en cours de développement</p>
      </div>
    </div>
  )
}
