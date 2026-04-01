'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { Map, Wallet, Building2, User, Lightbulb, LayoutDashboard, LogOut } from 'lucide-react'
import { logoutUser } from '@/app/actions/auth'
import { NotificationBell } from './NotificationBell'
import { getCurrentUser } from '@/app/actions/auth'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Carte', icon: Map },
  { href: '/bank', label: 'Ma Banque', icon: Wallet },
  { href: '/company/new', label: 'Créer Entreprise', icon: Building2 },
  { href: '/suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/profile', label: 'Profil', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setUserId(user.id)
    })
  }, [])

  return (
    <aside className="fixed left-0 top-0 h-full w-64 backdrop-blur-xl bg-black/40 border-r border-white/10 z-50">
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Ørbis</span>
            <span className="text-violet-400 text-sm">◎</span>
          </Link>
          <NotificationBell userId={userId} />
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={logoutUser}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Déconnexion</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
