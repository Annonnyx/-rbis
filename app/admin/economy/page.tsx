'use client'

import { useEffect, useState } from 'react'
import { getBankAccountForAdmin } from '@/app/actions/admin'
import { getCurrentUser } from '@/app/actions/auth'
import { GlassCard } from '@/components/GlassCard'
import { OrbeCurrency } from '@/components/OrbeCurrency'
import { Building2, Landmark, ArrowRightLeft } from 'lucide-react'

export default function AdminEconomyPage() {
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser()
      if (user) {
        const result = await getBankAccountForAdmin(user.id)
        if (result.account) {
          setAccount(result.account)
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
      <h1 className="text-3xl font-bold text-white">Économie</h1>

      {/* Banque Internationale */}
      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center border border-yellow-500/30">
            <Landmark size={32} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Banque Internationale Ørbis</h2>
            <p className="text-yellow-400">Compte administrateur</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-white/50 mb-1">Solde actuel</p>
            <OrbeCurrency 
              amount={account?.balance || 0n} 
              className="text-3xl font-bold text-white"
            />
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-white/50 mb-1">Numéro de compte</p>
            <p className="text-lg font-mono text-white">{account?.accountNumber || 'ORB-ADMIN-0001'}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <h3 className="font-semibold text-yellow-400 mb-2">Comment ça marche</h3>
          <ul className="text-sm text-white/70 space-y-2">
            <li className="flex items-start gap-2">
              <ArrowRightLeft size={16} className="mt-0.5 text-yellow-400" />
              <span>Les entreprises liquidées versent leur solde ici</span>
            </li>
            <li className="flex items-start gap-2">
              <Building2 size={16} className="mt-0.5 text-yellow-400" />
              <span>Si des actionnaires existent, ils reçoivent leur part d'abord</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">◎</span>
              <span>Le reste revient à la banque internationale (admin)</span>
            </li>
          </ul>
        </div>
      </GlassCard>

      {/* Règles de liquidation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="font-semibold text-white mb-3">Liquidation d'entreprise</h3>
          <div className="space-y-2 text-sm text-white/60">
            <p>1. Vérifier si l'entreprise a des actionnaires</p>
            <p>2. Verser les parts aux actionnaires (si bourse active)</p>
            <p>3. Transférer le solde restant vers ORB-ADMIN-0001</p>
            <p>4. Clôturer le compte entreprise</p>
            <p>5. Archiver l'entreprise</p>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-white mb-3">Notes</h3>
          <div className="space-y-2 text-sm text-white/60">
            <p>• Coût de création d'entreprise : ◎ 500,00</p>
            <p>• Ce coût est déduit du compte personnel</p>
            <p>• Limitation naturelle : max 2 entreprises avec crédit initial</p>
            <p>• Le solde de liquidation n'est pas remboursé</p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
