# Ørbis

Un monde virtuel qui grandit avec vos suggestions. Une simulation économique collaborative où vous créez votre entreprise, gérez vos finances, et façonnez l'économie.

## Fonctionnalités

- **Authentification** : Connexion avec Google
- **Monnaie Ørbe** : 1000 Ø offerts à l'inscription
- **Carte interactive** : Choisissez votre emplacement, débloquez de nouvelles villes
- **Création d'entreprise** : Lancez votre business (300 Ø minimum)
- **Système bancaire** : Gérez plusieurs comptes
- **Bourse** : Investissez dans les entreprises d'autres joueurs
- **Suggestions** : Proposez des idées pour faire évoluer le jeu

## Stack technique

- Next.js 14 + React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth.js v5
- next-themes (dark/light mode)

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env.local` avec :

```env
# Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# App
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
```

## Base de données

### Initialisation

```bash
# Pousser le schéma vers Supabase
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### Créer les villes initiales

```bash
# Appeler l'API d'initialisation
curl -X POST http://localhost:3000/api/init-city
```

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Structure du projet

```
app/
├── api/          # API routes
├── bank/         # Page banque
├── business/     # Page entreprise
├── dashboard/    # Dashboard
├── map/          # Carte
├── market/       # Bourse
├── profile/      # Profil
├── suggestions/  # Suggestions
├── globals.css   # Styles globaux
├── layout.tsx    # Layout principal
└── page.tsx      # Page d'accueil

components/
├── navigation.tsx # Navigation
└── ui/           # Composants UI

lib/
├── auth.ts       # Configuration auth
├── db.ts         # Client Prisma
└── utils.ts      # Utilitaires

prisma/
└── schema.prisma # Schéma de base de données

types/
└── next-auth.d.ts # Types NextAuth
```

## Fonctionnement

1. **Inscription** : Les nouveaux utilisateurs reçoivent 1000 Ø et sont placés dans la ville déverrouillée par défaut (Neo Paris)
2. **Entreprise** : Création possible avec 300 Ø minimum, génère automatiquement des actions en bourse
3. **Suggestions** : Les utilisateurs votent pour les idées, l'administrateur les implémente
4. **Carte** : De nouvelles villes se déverrouillent à mesure que le nombre d'utilisateurs augmente

## Licence

MIT
