// ============================================
// components/BottomNav.tsx
// Navigation mobile (bottom bar avec 5 onglets max)
// @example <BottomNav />
// ============================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Map, 
  Wallet, 
  Building2, 
  LayoutDashboard,
  Plus
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard },
  { href: '/map', icon: Map },
  { href: '/company/new', icon: Plus, primary: true },
  { href: '/bank', icon: Wallet },
  { href: '/profile', icon: Building2 },
]

/**
 * Navigation mobile (bottom bar)
 * 5 onglets maximum avec bouton central en surbrillance
 * Cachée sur desktop
 */
export function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/80 border-t border-white/10 z-50 lg:hidden pb-safe">
      <ul className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center justify-center rounded-xl transition-all duration-200',
                  item.primary 
                    ? 'w-12 h-12 bg-violet-600 text-white -mt-4 shadow-lg shadow-violet-600/30'
                    : 'w-12 h-12',
                  !item.primary && isActive && 'bg-violet-500/20 text-violet-400',
                  !item.primary && !isActive && 'text-white/50 hover:text-white/70'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={item.primary ? 24 : 20} />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
