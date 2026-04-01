# Ørbis

Une simulation socio-économique multijoueur en temps réel, minimaliste, qui évolue grâce aux suggestions des utilisateurs.

## Stack Technique

- **Framework** : Next.js 14 (App Router, TypeScript strict)
- **Base de données** : Supabase (PostgreSQL) + Prisma ORM
- **Auth** : Supabase Auth (email + password)
- **Styling** : Tailwind CSS - style glassmorphism
- **Carte** : Leaflet.js avec react-leaflet
- **Déploiement** : Vercel-ready

## Monnaie Fictive

La monnaie du jeu s'appelle l'**Orbe**, symbole **◎**.
Exemple d'affichage : `◎ 1 000,00`

Les montants sont toujours stockés en entier (centimes d'Orbe) pour éviter les erreurs de flottants.

## Installation

1. **Cloner le projet**
```bash
git clone <repo-url>
cd orbis
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

Remplissez les variables dans `.env.local` :
- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service Supabase
- `DATABASE_URL` : URL de connexion PostgreSQL

4. **Initialiser la base de données**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Seeder la base de données**
```bash
npx prisma db seed
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Structure du Projet

```
app/
├── actions/          # Server Actions (auth, bank, company, suggestions)
├── auth/
│   ├── login/        # Page de connexion
│   └── register/     # Inscription (3 étapes)
├── dashboard/        # Dashboard utilisateur
├── map/              # Carte interactive (Leaflet)
├── bank/             # Gestion bancaire
├── company/
│   ├── new/          # Créer une entreprise
│   └── [id]/         # Page entreprise
├── profile/          # Profil utilisateur
├── suggestions/      # Système de suggestions
└── page.tsx          # Landing page

components/
├── GlassCard.tsx     # Card glassmorphism
├── OrbeCurrency.tsx  # Affichage monnaie
├── Sidebar.tsx       # Navigation
└── ui/
    └── SuggestionCard.tsx

lib/
├── prisma.ts         # Client Prisma
├── supabase.ts       # Client Supabase
└── supabase-server.ts

prisma/
├── schema.prisma     # Schéma de base de données
└── seed.ts           # Données initiales

types/
└── index.ts          # Types TypeScript
```

## Fonctionnalités

### Authentification & Onboarding (3 étapes)
1. Création compte (email + password + username)
2. Prénom/Nom (modifiable une seule fois)
3. Sélection de la résidence sur carte

### Dashboard
- Solde total toutes banques
- Mes entreprises
- Dernières transactions
- Suggestions récentes
- Stats utilisateur

### Carte Interactive
- Leaflet.js avec fond CartoDB Dark Matter
- Zones débloquées/verrouillées
- Marqueurs entreprises
- Déblocage progressif selon nombre d'utilisateurs

### Système Bancaire
- Compte personnel + comptes entreprises
- Transferts entre comptes
- Historique des transactions
- Affichage formaté : `◎ X XXX,XX`

### Entreprises
- Création avec capital minimum (◎ 300,00)
- Capital déduit du compte personnel
- Aperçu en temps réel
- Page détaillée par entreprise

### Suggestions
- Soumettre des idées
- Système de votes
- Filtres par statut
- Tri par date/votes

## Règles Métier

- **Crédit initial** : ◎ 1 000,00 à l'inscription
- **Capital minimum entreprise** : ◎ 300,00
- **Déblocage zones** : Selon nombre d'utilisateurs (100, 500, 1000)
- **Display name** : Modifiable une seule fois
- **Monnaie** : Toujours stockée en centimes (BigInt)

## Scripts Disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run start        # Démarrage production
npm run lint         # ESLint
npm run seed         # Seeder la base de données
```

## Déploiement Vercel

1. Créer un projet sur Vercel
2. Connecter votre repository
3. Configurer les variables d'environnement dans Vercel
4. Déployer !

## Licence

Projet de démonstration / éducatif.
