import Link from 'next/link'
import { GlassCard } from '@/components/GlassCard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-16">
          {/* Header */}
          <header className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <span className="text-2xl">◎</span>
              </div>
              <span className="text-xl font-bold text-white">Ørbis</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login"
                className="text-white/70 hover:text-white transition-colors"
              >
                Connexion
              </Link>
              <Link 
                href="/auth/register"
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </header>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Bienvenue sur{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Ørbis
              </span>
            </h1>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Le premier metavers économique collaboratif. 
              Créez votre entreprise, commercez avec d'autres joueurs et développez votre empire virtuel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register"
                className="px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-all duration-200"
              >
                Commencer l'aventure
              </Link>
              <Link 
                href="/auth/login"
                className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all duration-200"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Comment fonctionne Ørbis ?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 text-violet-400 text-2xl">
              ◎
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Économie réelle</h3>
            <p className="text-white/60">
              Gérez votre propre banque, créez des entreprises et commercez avec d'autres joueurs en Orbes.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center mb-4 text-fuchsia-400 text-2xl">
              🗺️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Carte interactive</h3>
            <p className="text-white/60">
              Explorez une carte du monde dynamique, débloquez des territoires et établissez votre siège social.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400 text-2xl">
              🏢
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Entreprises</h3>
            <p className="text-white/60">
              Créez votre entreprise, définissez votre mission et gérez votre capital avec votre compte bancaire.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <GlassCard className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à rejoindre l'aventure ?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Inscrivez-vous maintenant et recevez <strong className="text-violet-400">◎ 1 000,00</strong> pour démarrer votre empire.
          </p>
          <Link 
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-all duration-200"
          >
            Créer mon compte gratuitement
          </Link>
        </GlassCard>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">◎</span>
            <span className="text-white/60">Ørbis - Le metavers économique collaboratif</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-white/50 hover:text-white text-sm transition-colors">
              Connexion
            </Link>
            <Link href="/auth/register" className="text-white/50 hover:text-white text-sm transition-colors">
              Inscription
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
