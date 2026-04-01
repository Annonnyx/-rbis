// ============================================
// app/layout.tsx
// Root layout avec sidebar et navigation
// ============================================

import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Ørbis - Metavers Économique',
  description: 'Simulation socio-économique multijoueur',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={GeistSans.className}>
        <div className="min-h-screen bg-[#0a0a0f]">
          {/* Desktop Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="lg:ml-64 pb-20 lg:pb-0">
            {children}
          </main>
          
          {/* Mobile Bottom Nav */}
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
