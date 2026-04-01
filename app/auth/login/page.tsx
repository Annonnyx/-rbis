// ============================================
// app/auth/login/page.tsx
// Page de connexion
// ============================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { loginUser } from '@/app/actions/auth'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const result = await loginUser(email, password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Erreur de connexion')
    }
    
    setLoading(false)
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
