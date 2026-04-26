"use client"

import { Orbit, Building2, Landmark, Map, Lightbulb, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="orbe-float mb-8">
          <Orbit className="w-24 h-24 text-orbe" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orbe to-orbe-light bg-clip-text text-transparent">
          Ørbis
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8">
          Un monde virtuel qui grandit avec vos suggestions.
          <br />
          Créez votre entreprise, gérez vos finances, façonnez l&apos;économie.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="px-8 py-4 bg-orbe text-white rounded-xl font-semibold hover:bg-orbe-dark transition-all transform hover:scale-105"
          >
            Commencer l&apos;aventure
          </Link>
          <a
            href="#features"
            className="px-8 py-4 glass rounded-xl font-semibold hover:bg-accent transition-all"
          >
            En savoir plus
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Une économie virtuelle complète
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Building2}
              title="Créez votre entreprise"
              description="Lancez votre business avec 300 Ø. Définissez votre produit ou service et faites-le prospérer."
            />
            <FeatureCard
              icon={Landmark}
              title="Gérez vos finances"
              description="Plusieurs comptes bancaires, transactions sécurisées, et un contrôle total sur votre argent."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Bourse en temps réel"
              description="Investissez dans les entreprises d&apos;autres joueurs. La bourse évolue avec l&apos;économie."
            />
            <FeatureCard
              icon={Map}
              title="Carte interactive"
              description="Choisissez votre emplacement sur la carte. Découvrez où se trouvent les autres entreprises."
            />
            <FeatureCard
              icon={Lightbulb}
              title="Suggestions"
              description="Proposez de nouvelles fonctionnalités, règles, ou événements. Le jeu évolue avec vos idées."
            />
            <FeatureCard
              icon={Orbit}
              title="La monnaie Ørbe"
              description="Utilisez la Ørbe (Ø), une monnaie fictive avec son propre symbole unique."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 glass">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <StepCard
              number={1}
              title="Inscription"
              description="Connectez-vous avec Google. Recevez 1000 Ø et choisissez votre emplacement."
            />
            <StepCard
              number={2}
              title="Créez"
              description="Lancez votre entreprise, définissez votre stratégie, et commencez à gagner."
            />
            <StepCard
              number={3}
              title="Influencez"
              description="Faites des suggestions pour façonner l&apos;économie. Votez pour les meilleures idées."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-muted-foreground">
        <p>Ørbis - La simulation économique collaborative</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="glass rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300">
      <Icon className="w-10 h-10 text-orbe mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="w-12 h-12 bg-orbe rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
