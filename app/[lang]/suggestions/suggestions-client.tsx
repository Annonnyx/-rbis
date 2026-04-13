"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Lightbulb } from "lucide-react"

const isBrowser = typeof window !== "undefined"

function useSafeSession() {
  if (!isBrowser) {
    return { data: null, status: "loading" as const }
  }
  return useSession()
}

interface Suggestion {
  id: string
  title: string
  description: string
  type: string
  status: string
  votes: number
  user: {
    name: string
    identifier: string
  }
  hasVoted: boolean
}

export function SuggestionsClient() {
  const { data: session, status } = useSafeSession()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchSuggestions()
    }
  }, [status])

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("/api/suggestions")
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Lightbulb className="w-12 h-12 text-orbe animate-pulse" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Suggestions</h1>
        <button className="px-4 py-2 bg-orbe text-white rounded-lg hover:bg-orbe-dark transition-colors">
          Nouvelle suggestion
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune suggestion pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    par {suggestion.user.name} ({suggestion.user.identifier})
                  </p>
                  <p className="text-muted-foreground mt-2">{suggestion.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`p-2 rounded-lg ${suggestion.hasVoted ? "bg-orbe text-white" : "bg-accent"}`}>
                    ▲ {suggestion.votes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
