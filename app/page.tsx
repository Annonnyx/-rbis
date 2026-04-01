import Link from 'next/link'
import { GlassCard } from '@/components/GlassCard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <GlassCard padding="lg" className="max-w-md w-full text-center">
          <h1 className="text-5xl font-bold text-white mb-2">Ørbis</h1>
          <p className="text-violet-400 text-lg mb-2">◎</p>
          <p className="text-white/60 mb-8">
            Une simulation socio-économique multijoueur en temps réel.
            <br />
            Créez, échangez, faites évoluer le monde ensemble.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/register"
              className="w-full py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all duration-200"
            >
              Créer un compte
            </Link>
            <Link
              href="/auth/login"
              className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200"
            >
              Se connecter
            </Link>
          </div>
        </GlassCard>

        <p className="mt-8 text-white/30 text-sm">
          Monnaie fictive : <span className="text-violet-400">◎ Orbe</span>
        </p>
      </div>
    </div>
  )
}
