// ============================================
// app/page.tsx
// Landing page avec animation et compteur temps réel
// ============================================

import { GlassCard } from '@/components/ui/GlassCard'
import { UserCounter } from '@/components/UserCounter'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        
        {/* Floating particles */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-violet-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-40 right-1/3 w-1 h-1 bg-fuchsia-400/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-violet-400/20 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero */}
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Ørbis
          </h1>
          <p className="text-xl md:text-2xl text-white/60 mb-4">
            Le premier metavers économique collaboratif
          </p>
          <p className="text-lg text-white/40 mb-12 max-w-lg mx-auto">
            Créez votre entreprise, gérez votre banque, et façonnez le monde avec d'autres joueurs en temps réel.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 justify-center max-w-sm mx-auto">
            <GoogleSignInButton
              variant="primary"
              size="lg"
              label="Commencer l'aventure"
            />
            <GoogleSignInButton
              variant="secondary"
              size="lg"
              label="Se connecter"
            />
          </div>
        </div>
        
        {/* User counter */}
        <div className="mt-16">
          <GlassCard padding="md" className="text-center">
            <p className="text-sm text-white/50 mb-1">Explorateurs déjà présents</p>
            <UserCounter />
          </GlassCard>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-white/20">
            Ørbis — Une simulation socio-économique
          </p>
        </div>
      </div>
    </div>
  )
}
