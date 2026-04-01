'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string>('')

  useEffect(() => {
    if (!searchParams) return

    // Debug: log all params
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    console.log('Callback params:', params)
    setDebug(`Params: ${JSON.stringify(params)}`)

    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      console.error('OAuth error:', errorParam, errorDescription)
      setError(errorDescription || 'OAuth error')
      setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(errorDescription || 'OAuth error')}`), 3000)
      return
    }

    if (!code) {
      console.error('No code provided')
      setError('No authorization code')
      setTimeout(() => router.push('/auth/login?error=missing_code'), 3000)
      return
    }

    // Exchange the code for a session
    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        console.error('Exchange error:', exchangeError)
        setError(exchangeError.message)
        setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`), 3000)
        return
      }

      // Check if user is authenticated
      supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
        if (userError || !user) {
          console.error('User error:', userError)
          setError('Failed to get user')
          setTimeout(() => router.push('/auth/login?error=auth_failed'), 3000)
          return
        }

        console.log('User authenticated:', user.id, user.email)
        
        // Check if user exists in our database - will redirect to onboarding if needed
        router.push('/auth/oauth-complete')
      })
    })
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Erreur de connexion</h1>
          <p className="text-red-400">{error}</p>
          <p className="text-white/50 mt-4">Redirection vers la page de connexion...</p>
          <p className="text-white/30 mt-2 text-xs font-mono">{debug}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-white">Connexion en cours...</h1>
        <p className="text-white/50 mt-2">Veuillez patienter</p>
        <p className="text-white/30 mt-2 text-xs font-mono">{debug}</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-white">Connexion en cours...</h1>
          <p className="text-white/50 mt-2">Veuillez patienter</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
