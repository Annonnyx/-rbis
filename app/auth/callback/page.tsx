'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { createOAuthUser } from '@/app/actions/auth'
import { checkOnboardingStatus } from '@/app/actions/auth'

// Create browser client with proper cookie handling
function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string>('')

  useEffect(() => {
    if (!searchParams) return

    // Create browser client inside useEffect to ensure it's created on client
    const supabase = createClient()

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
    supabase.auth.exchangeCodeForSession(code).then(async ({ error: exchangeError }) => {
      if (exchangeError) {
        console.error('Exchange error:', exchangeError)
        setError(exchangeError.message)
        setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`), 3000)
        return
      }

      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('User error:', userError)
        setError('Failed to get user')
        setTimeout(() => router.push('/auth/login?error=auth_failed'), 3000)
        return
      }

      console.log('User authenticated:', user.id, user.email)
      
      // Create or get user in our database
      if (user.email) {
        const result = await createOAuthUser(user.id, user.email)
        
        if (result.error) {
          console.error('Database user creation error:', result.error)
          setError(result.error)
          setTimeout(() => router.push(`/auth/login?error=${encodeURIComponent(result.error || 'Database error')}`), 3000)
          return
        }
        
        // Check onboarding status
        const onboardingStatus = await checkOnboardingStatus(user.id)
        
        if (onboardingStatus.complete) {
          // User has completed onboarding, go to dashboard
          router.push('/dashboard')
        } else {
          // User needs to complete onboarding
          router.push('/auth/oauth-complete')
        }
      } else {
        setError('No email provided from OAuth provider')
        setTimeout(() => router.push('/auth/login?error=no_email'), 3000)
      }
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
