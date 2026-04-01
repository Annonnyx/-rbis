import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import { isAdmin } from '@/app/actions/admin'
import { GlassCard } from '@/components/GlassCard'
import { NotificationBell } from '@/components/NotificationBell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const admin = await isAdmin(user.id)
  if (!admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 h-16 backdrop-blur-xl bg-black/40 border-b border-white/10 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Ørbis</span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-medium">
              ADMIN
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell userId={user.id} />
          <Link
            href="/dashboard"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Retour au jeu →
          </Link>
        </div>
      </header>

      <div className="pt-16 flex">
        {/* Admin Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-white/10 bg-black/20 p-4">
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="block px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
            >
              Dashboard Admin
            </Link>
            <Link
              href="/admin/suggestions"
              className="block px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
            >
              Suggestions à modérer
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
            >
              Utilisateurs
            </Link>
            <Link
              href="/admin/economy"
              className="block px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
            >
              Économie
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
