// ============================================
// components/Sidebar.tsx
// Navigation latérale fixe desktop avec 6 onglets
// @example <Sidebar />
// ============================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Map, 
  Wallet, 
  Building2, 
  User, 
  Lightbulb, 
  LayoutDashboard,
  LogOut
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Carte', icon: Map },
  { href: '/bank', label: 'Ma Banque', icon: Wallet },
  { href: '/company/new', label: 'Créer Entreprise', icon: Building2 },
  { href: '/suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/profile', label: 'Profil', icon: User },
]

/**
 * Sidebar de navigation desktop (fixe à gauche)
 * Active state automatique via usePathname
 * Accessible : liens avec aria-current
 */
export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="fixed left-0 top-0 h-full w-64 backdrop-blur-xl bg-black/40 border-r border-white/10 z-50 hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Ørbis</span>
            <span className="text-violet-400 text-sm">◎</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <form action="/api/auth/logout" method="POST">
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
