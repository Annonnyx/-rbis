// ============================================
// app/auth/register/page.tsx
// Onboarding en 3 étapes
// ============================================

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { z } from 'zod'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertCircle, Check, Loader2, Mail } from 'lucide-react'
import { 
  step1Schema, step2Schema, 
  type Step1Data, type Step2Data 
} from '@/lib/validations/auth'
import { 
  checkUsernameAvailability, 
  registerUser, 
  updateUserProfile,
  selectResidence 
} from '@/app/actions/auth'

// Dynamic import to avoid SSR issues with Leaflet
const MapLocationSelector = dynamic(
  () => import('@/components/MapLocationSelector').then(mod => mod.MapLocationSelector),
  { ssr: false, loading: () => (
    <div className="h-64 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
      <div className="animate-pulse text-white/40">Chargement de la carte...</div>
    </div>
  )}
)

// ============================================
// Étape 1 : Identifiants
// ============================================

function Step1({ 
  onNext, 
  data 
}: { 
  onNext: (data: Step1Data) => void
  data: Partial<Step1Data>
}) {
  const [formData, setFormData] = useState<Partial<Step1Data>>(data)
  const [errors, setErrors] = useState<Partial<Record<keyof Step1Data, string>>>({})
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  
  const debouncedCheckUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length < 3) return
      setCheckingUsername(true)
      const available = await checkUsernameAvailability(username)
      setUsernameAvailable(available)
      setCheckingUsername(false)
    }, 500),
    []
  )
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const result = step1Schema.safeParse(formData)
    
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof Step1Data
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }
    
    if (!usernameAvailable) {
      setErrors({ username: 'Ce nom d\'utilisateur est déjà pris' })
      setLoading(false)
      return
    }
    
    onNext(result.data)
    setLoading(false)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email || ''}
        onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
        error={errors.email}
        required
      />
      
      <div className="relative">
        <Input
          label="Nom d'utilisateur"
          value={formData.username || ''}
          onChange={e => {
            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
            setFormData(d => ({ ...d, username: val }))
            setUsernameAvailable(null)
            if (val.length >= 3) debouncedCheckUsername(val)
          }}
          error={errors.username}
          placeholder="votre_pseudo"
          rightIcon={
            checkingUsername ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/40" />
            ) : usernameAvailable === true ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : usernameAvailable === false ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : null
          }
          required
        />
        <p className="text-xs text-white/40 mt-1">
          3-20 caractères, lettres minuscules, chiffres, tirets et underscores. 
          <span className="text-amber-400"> Immuable.</span>
        </p>
      </div>
      
      <Input
        label="Mot de passe"
        type="password"
        value={formData.password || ''}
        onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
        error={errors.password}
        required
      />
      <p className="text-xs text-white/40 -mt-2">
        Min. 8 caractères, 1 majuscule, 1 chiffre
      </p>
      
      <Input
        label="Confirmer le mot de passe"
        type="password"
        value={formData.confirmPassword || ''}
        onChange={e => setFormData(d => ({ ...d, confirmPassword: e.target.value }))}
        error={errors.confirmPassword}
        required
      />
      
      <Button type="submit" loading={loading} className="w-full mt-6">
        Continuer
      </Button>
    </form>
  )
}

// ============================================
// Étape 1.5 : Vérification Email
// ============================================

function StepEmailVerification({
  email,
  onContinue,
}: {
  email: string
  onContinue: () => void
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-500/20 flex items-center justify-center">
          <Mail className="w-6 h-6 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Vérifiez votre email
        </h3>
        <p className="text-sm text-white/60 mb-3">
          Un email de confirmation a été envoyé à
        </p>
        <p className="text-sm font-medium text-violet-300 mb-4">
          {email}
        </p>
        <p className="text-xs text-white/40">
          Cliquez sur le lien dans l'email pour confirmer votre compte, puis revenez ici pour continuer.
        </p>
      </div>

      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-300">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Si vous ne voyez pas l'email, vérifiez votre dossier spam.
        </p>
      </div>

      <Button onClick={onContinue} className="w-full">
        J'ai vérifié mon email - Continuer
      </Button>
    </div>
  )
}

// ============================================
// Étape 2 : Identité
// ============================================

function Step2({ 
  onNext,
  onBack,
  data 
}: { 
  onNext: (data: Step2Data) => void
  onBack: () => void
  data: Partial<Step2Data>
}) {
  const [formData, setFormData] = useState<Partial<Step2Data>>(data)
  const [errors, setErrors] = useState<Partial<Record<keyof Step2Data, string>>>({})
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const result = step2Schema.safeParse(formData)
    
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof Step2Data
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setLoading(false)
      return
    }
    
    await onNext(result.data)
    setLoading(false)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
        <p className="text-sm text-amber-300">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          Vous pourrez modifier votre nom d'affichage <strong>une seule fois</strong> plus tard.
        </p>
      </div>
      
      <Input
        label="Prénom"
        value={formData.firstName || ''}
        onChange={e => setFormData(d => ({ ...d, firstName: e.target.value }))}
        error={errors.firstName}
        required
      />
      
      <Input
        label="Nom"
        value={formData.lastName || ''}
        onChange={e => setFormData(d => ({ ...d, lastName: e.target.value }))}
        error={errors.lastName}
        required
      />
      
      <div className="flex gap-3 mt-6">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
          Retour
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Continuer
        </Button>
      </div>
    </form>
  )
}

// ============================================
// Étape 3 : Résidence
// ============================================

function Step3({ 
  onSubmit,
  onBack,
  userId 
}: { 
  onSubmit: (userId: string, locationId: string) => Promise<void>
  onBack: () => void
  userId: string
}) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedLocation) {
      setError('Veuillez sélectionner une ville')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await onSubmit(userId, selectedLocation)
    } catch (err) {
      console.error('Step 3 submit error:', err)
      setError('Erreur lors de la sélection')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <MapLocationSelector 
        selectedId={selectedLocation}
        onSelect={setSelectedLocation}
      />
      
      <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <p className="text-sm text-violet-300 text-center">
          Vous recevrez un crédit initial de <strong>◎ 1 000,00</strong> sur votre compte bancaire.
        </p>
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
          Retour
        </Button>
        <Button 
          type="submit" 
          loading={loading} 
          disabled={!selectedLocation}
          className="flex-1"
        >
          Choisir cette ville
        </Button>
      </div>
    </form>
  )
}

// ============================================
// Main Component
// ============================================

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Partial<Step1Data>>({})
  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({})
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  
  async function handleStep1(data: Step1Data) {
    setStep1Data(data)
    setError('')
    
    try {
      const result = await registerUser({
        email: data.email,
        password: data.password,
        username: data.username,
      })
      
      if (result.success) {
        setUserId(result.data!.userId)
        setStep(1.5) // Aller à l'étape vérification email
      } else {
        setError(result.error || 'Erreur lors de l\'inscription')
      }
    } catch (err) {
      console.error('Step 1 error:', err)
      setError('Erreur inattendue lors de l\'inscription')
    }
  }
  
  async function handleStep2(data: Step2Data) {
    setStep2Data(data)
    setError('')
    
    try {
      const result = await updateUserProfile(userId, data)
      
      if (result.success) {
        setStep(3)
      } else {
        setError(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Step 2 error:', err)
      setError('Erreur inattendue lors de la mise à jour')
    }
  }
  
  async function handleStep3Submit(userId: string, locationId: string) {
    setError('')
    
    try {
      const result = await selectResidence(userId, locationId)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Erreur lors de la sélection')
      }
    } catch (err) {
      console.error('Step 3 error:', err)
      setError('Erreur inattendue lors de la sélection')
    }
  }
  
  const titles = ['', 'Créer un compte', 'Vérification email', 'Votre identité', 'Choisir votre résidence']
  const subtitles = ['', 'Étape 1 sur 4', 'Étape 2 sur 4', 'Étape 3 sur 4', 'Étape 4 sur 4']
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>
      
      <GlassCard padding="lg" className="relative z-10 w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= Math.ceil(step) ? 'bg-violet-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {titles[step]}
        </h1>
        <p className="text-white/50 text-center mb-8">{subtitles[step]}</p>
        
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {step === 1 && (
          <Step1 onNext={handleStep1} data={step1Data} />
        )}

        {step === 1.5 && (
          <StepEmailVerification
            email={step1Data.email || ''}
            onContinue={() => setStep(2)}
          />
        )}
        
        {step === 2 && (
          <Step2 
            onNext={handleStep2} 
            onBack={() => setStep(1.5)} 
            data={step2Data} 
          />
        )}
        
        {step === 3 && (
          <Step3 
            onSubmit={handleStep3Submit}
            onBack={() => setStep(2)}
            userId={userId}
          />
        )}
      </GlassCard>
    </div>
  )
}

// ============================================
// Utility
// ============================================

function debounce<T extends (arg: string) => Promise<void>>(
  fn: T,
  delay: number
): (arg: string) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (arg) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(arg), delay)
  }
}
