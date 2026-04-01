'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCompany } from '@/app/actions/company'
import { getCurrentUser } from '@/app/actions/auth'
import { GlassCard } from '@/components/GlassCard'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { Building2 } from 'lucide-react'

const MINIMUM_CAPITAL = 50000n // ◎ 500,00 en centimes

export default function NewCompanyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    description: '',
    capital: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const user = await getCurrentUser()
    if (!user) {
      setError('Utilisateur non connecté')
      setLoading(false)
      return
    }

    const capitalInCentimes = Math.round(parseFloat(formData.capital) * 100)

    if (BigInt(capitalInCentimes) < MINIMUM_CAPITAL) {
      setError('Le capital minimum est de ◎ 500,00')
      setLoading(false)
      return
    }

    const result = await createCompany(user.id, {
      name: formData.name,
      objective: formData.objective,
      description: formData.description,
      capital: BigInt(capitalInCentimes),
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.companyId) {
      router.push(`/company/${result.companyId}`)
    }
  }

  const capitalNum = parseFloat(formData.capital) || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Créer mon entreprise</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <GlassCard>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Nom de l&apos;entreprise
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="Mon entreprise"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Objectif (max 200 caractères)
              </label>
              <textarea
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 resize-none"
                placeholder="Notre mission est de..."
                rows={3}
                maxLength={200}
                required
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.objective.length}/200 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Description produit/service (max 500 caractères)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 resize-none"
                placeholder="Nous proposons..."
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.description.length}/500 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Capital de départ (◎)
              </label>
              <input
                type="number"
                step="0.01"
                min="500"
                value={formData.capital}
                onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="500.00"
                required
              />
              <p className="text-xs text-violet-400 mt-1">
                Minimum : ◎ 500,00
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold transition-all duration-200"
            >
              {loading ? 'Création...' : 'Créer l\'entreprise'}
            </button>
          </form>
        </GlassCard>

        {/* Preview */}
        <GlassCard className="h-fit">
          <h2 className="text-xl font-semibold text-white mb-4">Aperçu</h2>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/30 flex items-center justify-center">
                <Building2 size={24} className="text-violet-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {formData.name || 'Nom de l\'entreprise'}
                </h3>
                <p className="text-sm text-cyan-400">{formData.objective || 'Objectif...'}</p>
              </div>
            </div>
            
            <p className="text-white/60 text-sm mb-4 line-clamp-3">
              {formData.description || 'Description de l\'entreprise...'}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-white/50 text-sm">Capital</span>
              <OrbeCurrency amount={BigInt(Math.round(capitalNum * 100))} className="text-lg font-semibold text-violet-300" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
