// ============================================
// app/auth/login/page.tsx
// Page de connexion
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  
  // Vérifier si déjà connecté au chargement
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createBrowserSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('[LoginPage] Initial session check:', { hasSession: !!session })
      
      if (session) {
        console.log('[LoginPage] Already has session, redirecting to dashboard')
        router.replace('/dashboard')
      } else {
        setIsCheckingSession(false)
      }
    }
    
    checkSession()
  }, [router])
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    console.log('[LoginPage] Submitting login form...')
    
    // Utiliser le client Supabase côté client pour que les cookies soient correctement définis
    const supabase = createBrowserSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('[LoginPage] Login result:', { success: !error, error: error?.message })
    
    if (error) {
      console.log('[LoginPage] Login failed:', error.message)
      setError(error.message)
      setLoading(false)
    } else {
      console.log('[LoginPage] Login success, user:', data.user?.id)
      console.log('[LoginPage] Session established, redirecting to dashboard')
      // Utiliser window.location pour forcer la navigation complète
      window.location.href = '/dashboard'
    }
  }
  
  // Afficher un état de chargement pendant la vérification de session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white/40">Vérification de la session...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>
      
      <GlassCard padding="lg" className="relative z-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Connexion</h1>
        <p className="text-white/50 text-center mb-8">Bienvenue sur Ørbis</p>
        
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="votre@email.com"
            required
          />
          
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
          
          <Button type="submit" loading={loading} className="w-full mt-6">
            Se connecter
          </Button>
        </form>
        
        <p className="mt-6 text-center text-white/50 text-sm">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-violet-400 hover:text-violet-300">
            Créer un compte
          </Link>
        </p>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-white/30 hover:text-white/50">
            ← Retour à l'accueil
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
