# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added
- Système de suggestions communautaires avec vote
- Interface admin pour modérer les suggestions
- Profil utilisateur complet avec statistiques
- Modal de modification du displayName (limité à 1 fois)

## [1.0.0] - 2026-04-01

### Added
- Authentification complète (login, register, onboarding 3 étapes)
- Création de comptes bancaires avec solde initial (◎ 1 000,00)
- Système d'entreprises (création, gestion, capital)
- Transferts bancaires sécurisés entre joueurs
- Carte interactive avec 4 villes (Nova, Astra, Forge, Apex)
- Système de déblocage des villes selon le nombre de joueurs
- Dashboard avec statistiques en temps réel
- Design system glassmorphism cohérent
- Transactions atomiques avec Prisma
- Supabase Realtime pour les compteurs en direct

### Technical
- Stack : Next.js 14, TypeScript strict, Prisma, Supabase, Tailwind CSS
- Architecture : App Router, Server Actions, Server Components
- Sécurité : Middleware d'authentification, validation Zod
- Performance : Suspense + skeletons pour le chargement

---

*Ce changelog sera mis à jour à chaque nouvelle version.*
