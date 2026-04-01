# Ørbis

> Une simulation socio-économique multijoueur où les utilisateurs créent des entreprises, gèrent un compte bancaire fictif, et font évoluer le monde via des suggestions.

## Stack Technique

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Langage**: TypeScript (strict mode)
- **Base de données**: PostgreSQL via [Supabase](https://supabase.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: Supabase Auth
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Déploiement**: [Vercel](https://vercel.com/)

---

## Prérequis

- Node.js 18+
- npm ou pnpm
- Un projet Supabase actif
- Un compte Vercel (pour le déploiement)

---

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone <repo-url>
cd orbis
npm install
```

### 2. Configuration des variables d'environnement

```bash
cp .env.example .env
```

Remplissez les variables dans `.env` :

- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé publique (anon)
- `SUPABASE_SERVICE_ROLE_KEY` : Clé privée (service_role) - **ne jamais exposer**
- `DATABASE_URL` : Connection pooling URL (avec `pgbouncer=true`)
- `DIRECT_URL` : URL directe pour les migrations

### 3. Configuration de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer et appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Remplir avec les données initiales
npx prisma db seed
```

### 4. Lancer en développement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:3000`

---

## Structure du projet

```
orbis/
├── app/                    # App Router Next.js
│   ├── actions/           # Server Actions (mutations métier)
│   ├── auth/              # Routes auth (login, register, callback)
│   ├── dashboard/         # Dashboard utilisateur
│   └── ...                # Autres routes
├── components/            # Composants React
│   ├── ui/               # Composants génériques (buttons, cards...)
│   ├── bank/             # Composants spécifiques banque
│   ├── map/              # Composants carte
│   └── company/          # Composants entreprise
├── lib/                   # Utilitaires partagés
│   ├── prisma.ts        # Client Prisma (singleton)
│   ├── supabase.ts      # Clients Supabase (server/browser)
│   └── currency.ts      # Formatage monétaire
├── types/                 # Types TypeScript globaux
├── prisma/
│   ├── schema.prisma    # Schéma de données
│   └── seed.ts          # Données initiales
├── public/               # Assets statiques
└── ...config files
```

### Conventions

- **App Router**: Toutes les pages sont dans `app/`, organisées par domaine
- **Server Actions**: Toutes les mutations serveur sont dans `app/actions/`
- **Types**: Aucun `any`, tous les types sont dans `types/` ou générés par Prisma
- **Commentaires**: Chaque fichier exporté a un commentaire JSDoc expliquant son rôle

---

## Routes de l'Application

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page avec compteur realtime |

### Authentification
| Route | Description |
|-------|-------------|
| `/auth/login` | Connexion email/password |
| `/auth/register` | Inscription en 3 étapes (identifiants → profil → résidence) |

### Application (authentification requise)
| Route | Description |
|-------|-------------|
| `/dashboard` | Vue d'ensemble (solde, entreprises, transactions, suggestions) |
| `/bank` | Gestion des comptes et virements |
| `/map` | Carte interactive des villes et entreprises |
| `/company/new` | Création d'une entreprise |
| `/company/[id]` | Détail d'une entreprise |
| `/profile` | Profil utilisateur et paramètres |
| `/suggestions` | Liste des suggestions avec filtres et tri |
| `/suggestions/new` | Créer une nouvelle suggestion |

### Administration (admin requis)
| Route | Description |
|-------|-------------|
| `/admin/suggestions` | Gestion des suggestions (accept/reject/implement) |

---

## Server Actions

Toutes les mutations serveur sont dans `app/actions/` :

- `auth.ts` — login, register, updateProfile, selectResidence
- `bank.ts` — getUserAccounts, getTransactionHistory, transferFunds
- `company.ts` — createCompany, getCompanyById, updateCompany
- `suggestions.ts` — createSuggestion, voteSuggestion, getSuggestions
- `profile.ts` — updateDisplayName, getUserStats

---

## Modèle de données

### Utilisateur
- `username` unique et immuable (identifiant public)
- `displayName` modifiable (une seule fois)
- Auth gérée par Supabase, profil dans Prisma

### Économie
- **BankAccount**: PERSONAL ou COMPANY, balance en centimes (BigInt)
- **Transaction**: transferts entre comptes avec label optionnel
- **Company**: entreprise avec compte capital dédié

### Monde
- **MapLocation**: zones géographiques, certaines débloquées par nombre d'utilisateurs
- **Suggestion**: propositions d'amélioration votées par la communauté

---

## Commandes utiles

```bash
# Développement
npm run dev              # Lancer le serveur de dev

# Base de données
npx prisma studio        # GUI Prisma
npx prisma migrate dev   # Nouvelle migration
npx prisma db seed       # Réinitialiser les données initiales

# Build
npm run build            # Build production
npm run start            # Lancer en production
```

---

## Déploiement

1. Connecter le repo à Vercel
2. Configurer les variables d'environnement dans l'interface Vercel
3. Déployer

Pour les migrations de base de données en production :
```bash
npx prisma migrate deploy
```

---

## License

MIT
