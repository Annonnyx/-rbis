'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/app/actions/auth'
import { updateDisplayName, getUserStats } from '@/app/actions/user'
import { GlassCard } from '@/components/GlassCard'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { User, Building2, Lightbulb, Edit2, AlertTriangle } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [showEditName, setShowEditName] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setNewDisplayName(currentUser.displayName || '')
        const userStats = await getUserStats(currentUser.id)
        setStats(userStats)
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setUpdating(true)
    setError('')

    const result = await updateDisplayName(user.id, newDisplayName)

    if (result.error) {
      setError(result.error)
      setUpdating(false)
      return
    }

    setUser({ ...user, displayName: newDisplayName, displayNameChanged: true })
    setShowEditName(false)
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/50">Chargement...</p>
      </div>
    )
  }

  if (!user) return null

  // Get initials for avatar
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.username.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Profil</h1>

      {/* Profile Card */}
      <GlassCard>
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">
                {user.displayName || `${user.firstName} ${user.lastName}`}
              </h2>
              {!user.displayNameChanged && (
                <button
                  onClick={() => setShowEditName(true)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all duration-200"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            <p className="text-cyan-400">@{user.username}</p>
            <p className="text-white/50 mt-2">{user.email}</p>
          </div>
        </div>

        {/* Edit Display Name Modal */}
        {showEditName && (
          <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 text-violet-300 mb-3">
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">
                Attention : vous ne pourrez modifier votre nom d&apos;affichage qu&apos;une seule fois.
              </span>
            </div>
            {error && (
              <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleUpdateName} className="flex gap-3">
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                placeholder="Nouveau nom d'affichage"
                required
              />
              <button
                type="button"
                onClick={() => setShowEditName(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold transition-all duration-200"
              >
                {updating ? '...' : 'Confirmer'}
              </button>
            </form>
          </div>
        )}
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <User size={24} className="text-violet-400" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Solde total</p>
            <OrbeCurrency amount={stats?.totalBalance || 0n} className="text-xl font-semibold text-white" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Building2 size={24} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Entreprises</p>
            <p className="text-xl font-semibold text-white">{stats?.companiesCount || 0}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Lightbulb size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Suggestions</p>
            <p className="text-xl font-semibold text-white">{stats?.suggestionsCount || 0}</p>
          </div>
        </GlassCard>
      </div>

      {/* Settings */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-4">Paramètres</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Changer l&apos;email</p>
              <p className="text-sm text-white/50">{user.email}</p>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-white/5 text-white/30 text-sm cursor-not-allowed"
            >
              Bientôt disponible
            </button>
          </div>
          <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Changer le mot de passe</p>
              <p className="text-sm text-white/50">Mettez à jour votre sécurité</p>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-white/5 text-white/30 text-sm cursor-not-allowed"
            >
              Bientôt disponible
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
