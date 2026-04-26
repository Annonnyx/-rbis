"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Orbit, Chrome } from "lucide-react"
import { Suspense } from "react"

function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8">
        <div className="text-center mb-8">
          <Orbit className="w-16 h-16 text-orbe mx-auto mb-4 orbe-float" />
          <h1 className="text-3xl font-bold mb-2">Bienvenue sur Ørbis</h1>
          <p className="text-muted-foreground">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            Une erreur est survenue lors de la connexion. Veuillez réessayer.
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
        >
          <Chrome className="w-5 h-5" />
          Continuer avec Google
        </button>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>En vous connectant, vous recevrez :</p>
          <ul className="mt-2 space-y-1">
            <li>• 1000 Ørbe (Ø) de départ</li>
            <li>• Un emplacement sur la carte</li>
            <li>• Un compte bancaire personnel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md glass rounded-2xl p-8 text-center">
          <Orbit className="w-16 h-16 text-orbe mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
