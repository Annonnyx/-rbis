'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerUser, completeProfile, selectResidence } from '@/app/actions/auth'
import { getUnlockedLocations } from '@/app/actions/map'
import { GlassCard } from '@/components/GlassCard'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [locations, setLocations] = useState<Array<{ id: string; name: string; lat: number; lng: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  // Step 2 data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await registerUser(email, password, username)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.userId) {
      setUserId(result.userId)
      setStep(2)
    }
    setLoading(false)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await completeProfile(userId, firstName, lastName)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Load locations for step 3
    const locationsResult = await getUnlockedLocations()
    if (locationsResult.locations) {
      setLocations(locationsResult.locations)
    }

    setStep(3)
    setLoading(false)
  }

  async function handleStep3(locationId: string) {
    setLoading(true)
    setError('')

    const result = await selectResidence(userId, locationId)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <GlassCard padding="lg" className="relative z-10 w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-violet-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {step === 1 && 'Créer un compte'}
          {step === 2 && 'Votre profil'}
          {step === 3 && 'Choisir votre résidence'}
        </h1>
        <p className="text-white/50 text-center mb-8">
          {step === 1 && 'Étape 1 sur 3'}
          {step === 2 && 'Étape 2 sur 3'}
          {step === 3 && 'Étape 3 sur 3 - Sélectionnez votre ville de départ'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nom d&apos;utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="pseudo"
                pattern="[a-z0-9_-]+"
                title="Lettres minuscules, chiffres, tirets et underscores uniquement"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold transition-all duration-200"
            >
              {loading ? 'Création...' : 'Continuer'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0a0a0f] text-white/50">ou</span>
              </div>
            </div>

            <GoogleSignInButton />
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="Jean"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="Dupont"
                required
              />
            </div>

            <p className="text-xs text-white/40">
              Cette information pourra être modifiée une seule fois plus tard.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold transition-all duration-200"
            >
              {loading ? 'Enregistrement...' : 'Continuer'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleStep3(location.id)}
                  disabled={loading}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 text-left transition-all duration-200"
                >
                  <h3 className="font-semibold text-white">{location.name}</h3>
                  <p className="text-sm text-white/50">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-sm text-violet-300">
                Vous recevrez un crédit initial de <strong>◎ 1 000,00</strong> sur votre compte bancaire.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <p className="mt-6 text-center text-white/50 text-sm">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">
              Se connecter
            </Link>
          </p>
        )}
      </GlassCard>
    </div>
  )
}
