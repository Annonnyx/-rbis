'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { completeProfile } from '@/app/actions/auth'
import { getUnlockedLocations } from '@/app/actions/map'
import { GlassCard } from '@/components/GlassCard'

export default function OAuthCompletePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [locations, setLocations] = useState<Array<{ id: string; name: string; lat: number; lng: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const user = await getCurrentUser()
    if (!user) {
      setError('Session non trouvée')
      setLoading(false)
      return
    }

    const result = await completeProfile(user.id, firstName, lastName)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Load locations for step 2
    const locationsResult = await getUnlockedLocations()
    if (locationsResult.locations) {
      setLocations(locationsResult.locations)
    }
    
    setStep(2)
    setLoading(false)
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <GlassCard padding="lg" className="relative z-10 w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <span className="text-violet-400 text-sm font-bold">2</span>
            </div>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-violet-500 rounded-full" />
            </div>
            <span className="text-white/50 text-sm">2/3</span>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Complétez votre profil
          </h1>
          <p className="text-white/50 text-center mb-8">
            Connexion Google réussie ! Finalisez votre inscription.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="Votre prénom"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="Votre nom"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold transition-all duration-200"
            >
              {loading ? 'Enregistrement...' : 'Continuer'}
            </button>
          </form>
        </GlassCard>
      </div>
    )
  }

  // Step 2: Select residence
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <GlassCard padding="lg" className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
            <span className="text-violet-400 text-sm font-bold">3</span>
          </div>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-full bg-violet-500 rounded-full" />
          </div>
          <span className="text-white/50 text-sm">3/3</span>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Choisissez votre résidence
        </h1>
        <p className="text-white/50 text-center mb-8">
          Sélectionnez une zone débloquée comme lieu de résidence.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={async () => {
                setLoading(true)
                const user = await getCurrentUser()
                if (!user) {
                  setError('Session non trouvée')
                  setLoading(false)
                  return
                }
                
                // Import selectResidence dynamically to avoid circular dependency
                const { selectResidence } = await import('@/app/actions/auth')
                const result = await selectResidence(user.id, location.id)
                
                if (result.error) {
                  setError(result.error)
                  setLoading(false)
                  return
                }
                
                router.push('/dashboard')
              }}
              disabled={loading}
              className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all duration-200"
            >
              <h3 className="font-semibold text-white">{location.name}</h3>
              <p className="text-sm text-white/50">
                {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
