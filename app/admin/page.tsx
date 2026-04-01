import { getAdminStats } from '@/app/actions/admin'
import { GlassCard } from '@/components/GlassCard'
import { Users, Building2, Wallet, Lightbulb, MapPin } from 'lucide-react'

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  const formatOrbes = (centimes: bigint) => {
    const orbes = centimes / 100n
    return orbes.toLocaleString('fr-FR')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Users size={24} className="text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            <p className="text-sm text-white/50">Utilisateurs</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Building2 size={24} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.totalCompanies}</p>
            <p className="text-sm text-white/50">Entreprises</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Wallet size={24} className="text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{formatOrbes(stats.totalOrbesInCirculation)}</p>
            <p className="text-sm text-white/50">Orbes en circulation</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Lightbulb size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.pendingSuggestions}</p>
            <p className="text-sm text-white/50">Suggestions en attente</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <MapPin size={24} className="text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.unlockedLocations}</p>
            <p className="text-sm text-white/50">Zones débloquées</p>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/suggestions"
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/30 transition-all"
          >
            <h3 className="font-semibold text-white mb-1">Modérer les suggestions</h3>
            <p className="text-sm text-white/50">{stats.pendingSuggestions} en attente</p>
          </a>
          <a
            href="/admin/users"
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 transition-all"
          >
            <h3 className="font-semibold text-white mb-1">Gérer les utilisateurs</h3>
            <p className="text-sm text-white/50">Voir tous les comptes</p>
          </a>
          <a
            href="/admin/economy"
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 transition-all"
          >
            <h3 className="font-semibold text-white mb-1">Contrôler l'économie</h3>
            <p className="text-sm text-white/50">Banque internationale</p>
          </a>
        </div>
      </GlassCard>
    </div>
  )
}
