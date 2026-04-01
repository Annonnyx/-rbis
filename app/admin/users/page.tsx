'use client'

import { useEffect, useState } from 'react'
import { getAllUsersForAdmin } from '@/app/actions/admin'
import { getCurrentUser } from '@/app/actions/auth'
import { GlassCard } from '@/components/GlassCard'
import { User, Building2, Lightbulb, Calendar } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser()
      if (user) {
        setUserId(user.id)
        const result = await getAllUsersForAdmin(user.id)
        if (result.users) {
          setUsers(result.users)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/50">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Gestion des utilisateurs</h1>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-white/50">Utilisateur</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/50">Email</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-white/50">
                  <Building2 size={16} className="inline" />
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-white/50">
                  <Lightbulb size={16} className="inline" />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/50">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <User size={14} className="text-violet-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.displayName || user.username}</p>
                        <p className="text-xs text-white/50">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/60 text-sm">{user.email}</td>
                  <td className="py-3 px-4 text-center text-white/60">{user._count.companies}</td>
                  <td className="py-3 px-4 text-center text-white/60">{user._count.suggestions}</td>
                  <td className="py-3 px-4 text-white/50 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
