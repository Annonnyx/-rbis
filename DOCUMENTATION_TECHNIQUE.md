# Ørbis - Documentation Technique

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │  Next.js 14 │  │ TailwindCSS │  │  React/TS       │     │
│  │  App Router │  │Glassmorphism│  │  Client Comps   │     │
│  └──────┬──────┘  └─────────────┘  └─────────────────┘     │
└─────────┼───────────────────────────────────────────────────┘
          │ Server Actions
┌─────────┼───────────────────────────────────────────────────┐
│         ▼                   SERVER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐      │
│  │  Next.js    │  │  Prisma ORM │  │  Server Actions │      │
│  │  API Routes │  │  PostgreSQL │  │  (app/actions)│       │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────┘      │
│         │                │                                  │
│         │                ▼                                  │
│         │         ┌─────────────┐                           │
│         │         │  Supabase │                            │
│         │         │  Auth + DB │                           │
│         │         └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐
│     User     │     │   GameProfile    │     │  MapLocation  │
├──────────────┤     ├──────────────────┤     ├───────────────┤
│ id (PK)      │────▶│ id (PK)          │────▶│ id (PK)       │
│ email        │     │ userId (FK)      │     │ name          │
│ username     │     │ homeLocationId   │     │ lat           │
│ displayName  │     │ totalBalance     │     │ lng           │
│ firstName    │     └──────────────────┘     │ unlocked      │
│ lastName     │                              │ requiredUsers │
│ avatarUrl    │                              └───────────────┘
│ createdAt    │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐     ┌──────────────────┐
│ BankAccount  │────▶│   Transaction    │
├──────────────┤ 1:N ├──────────────────┤
│ id (PK)      │     │ id (PK)          │
│ ownerId (FK) │     │ fromAccountId    │
│ ownerType    │     │ toAccountId      │
│ companyId    │     │ amount           │
│ balance      │     │ label            │
│ accountNumber│     │ createdAt        │
│ createdAt    │     └──────────────────┘
└──────┬───────┘
       │
       │ 1:1 (optional)
       ▼
┌──────────────┐
│    Company   │
├──────────────┤
│ id (PK)      │
│ ownerId (FK) │
│ name         │
│ objective    │
│ description  │
│ locationId   │
│ capitalAccount│
└──────────────┘

┌──────────────┐     ┌──────────────────┐
│  Suggestion  │────▶│ SuggestionVote   │
├──────────────┤ 1:N ├──────────────────┤
│ id (PK)      │     │ id (PK)          │
│ authorId(FK) │     │ userId (FK)      │
│ title        │     │ suggestionId(FK)│
│ description  │     └──────────────────┘
│ status       │
│ upvotes      │
└──────────────┘
```

## Server Actions API Reference

### Auth Actions (`app/actions/auth.ts`)

#### `registerUser(email, password, username)`
- **Purpose**: Crée un nouvel utilisateur (Supabase Auth + Prisma)
- **Validation**: Email format, password ≥ 8 chars, username regex `^[a-z0-9_-]+$`
- **Returns**: `{ success: true, userId }` or `{ error: string }`
- **Side Effects**: Crée user dans Supabase Auth et table `users`

#### `completeProfile(userId, firstName, lastName)`
- **Purpose**: Complète le profil utilisateur (Step 2 onboarding)
- **Returns**: `{ success: true }` or `{ error: string }`
- **Updates**: `firstName`, `lastName`, `displayName`

#### `selectResidence(userId, locationId)`
- **Purpose**: Sélectionne la résidence (Step 3 onboarding)
- **Business Logic**: 
  - Vérifie que la location est unlocked
  - Crée un compte bancaire avec ◎ 1 000,00 (100000 centimes)
  - Crée le GameProfile
  - Déclenche `checkLocationUnlocks()`
- **Returns**: `{ success: true }` or `{ error: string }`

#### `checkLocationUnlocks()`
- **Purpose**: Débloque automatiquement les zones selon le nombre d'utilisateurs
- **Logic**: `totalUsers >= requiredUsersToUnlock` → `unlocked = true`
- **Called**: Après chaque inscription

#### `loginUser(email, password)`
- **Purpose**: Authentifie l'utilisateur
- **Returns**: `{ error: string }` or redirect to `/dashboard`

#### `logoutUser()`
- **Purpose**: Déconnecte l'utilisateur
- **Side Effects**: Supprime le cookie Supabase, redirect to `/`

#### `getCurrentUser()`
- **Purpose**: Récupère l'utilisateur courant avec son profil complet
- **Returns**: User + GameProfile + homeLocation ou `null`

### Company Actions (`app/actions/company.ts`)

#### `createCompany(userId, { name, objective, description, capital })`
- **Purpose**: Crée une nouvelle entreprise
- **Validation**: Capital minimum ◎ 300,00 (30000 centimes)
- **Transaction Atomique**:
  1. Déduit le capital du compte personnel
  2. Crée un compte bancaire entreprise
  3. Crée l'entreprise
  4. Enregistre la transaction
  5. Met à jour le totalBalance du user
- **Returns**: `{ success: true, companyId }` or `{ error: string }`

#### `getUserCompanies(userId)`
- **Returns**: Liste des entreprises avec capitalAccount et location

#### `getCompanyById(companyId, userId)`
- **Security**: Vérifie que l'user est le owner
- **Returns**: Company + capitalAccount + location + owner + transactions récentes

### Bank Actions (`app/actions/bank.ts`)

#### `getUserAccounts(userId)`
- **Returns**: Tous les comptes (personnel + entreprises) avec transactions récentes

#### `getAccountTransactions(accountId, page?, pageSize?)`
- **Pagination**: Défaut 10 items/page
- **Returns**: Transactions + pagination info

#### `transferFunds(fromAccountId, toAccountNumber, amount, label?, userId)`
- **Security**: Vérifie que fromAccount appartient au user
- **Validation**: 
  - Compte destinataire existe
  - Pas de transfert vers soi-même
  - Solde suffisant
- **Transaction Atomique**:
  1. Déduit du compte source
  2. Ajoute au compte destination
  3. Crée l'enregistrement transaction
  4. Met à jour les totalBalance si comptes personnels
- **Returns**: `{ success: true }` or `{ error: string }`

### Suggestions Actions (`app/actions/suggestions.ts`)

#### `submitSuggestion(userId, title, description)`
- **Status**: `PENDING` par défaut
- **Returns**: `{ success: true, suggestionId }`

#### `getSuggestions(status?, sortBy?, page?, pageSize?)`
- **Filters**: `ALL`, `PENDING`, `ACCEPTED`, `REJECTED`, `IMPLEMENTED`
- **Sort**: `recent` (date) ou `votes` (upvotes desc)
- **Returns**: Suggestions + pagination

#### `getSuggestionsWithVotes(userId, status?, sortBy?)`
- **Special**: Ajoute `hasVoted: boolean` pour chaque suggestion

#### `voteSuggestion(userId, suggestionId)`
- **Idempotency**: Un seul vote par user par suggestion (contrainte DB)
- **Transaction**: Crée le vote + incrémente upvotes
- **Returns**: `{ success: true }` or `{ error: string }` (déjà voté)

### User Actions (`app/actions/user.ts`)

#### `updateDisplayName(userId, newName)`
- **Restriction**: Ne fonctionne que si `displayNameChanged === false`
- **After**: Met `displayNameChanged = true`

#### `updateEmail(userId, newEmail)`
- **TODO**: Implémenter avec Supabase Auth updateUser

#### `updatePassword(newPassword)`
- **TODO**: Implémenter avec Supabase Auth updateUser

#### `getUserStats(userId)`
- **Returns**: `{ totalBalance, companiesCount, suggestionsCount }`

### Map Actions (`app/actions/map.ts`)

#### `getUnlockedLocations()`
- **Returns**: Locations avec `unlocked = true` (pour onboarding step 3)

#### `getAllLocations()`
- **Returns**: Toutes les locations avec entreprises associées + totalUsers count

## Routes & Pages

### Public Routes
| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page avec animations CSS |
| `/auth/login` | `app/auth/login/page.tsx` | Formulaire de connexion |
| `/auth/register` | `app/auth/register/page.tsx` | Onboarding 3 étapes |

### Protected Routes (middleware.ts)
| Route | File | Data Fetching | Interactivity |
|-------|------|---------------|---------------|
| `/dashboard` | `app/dashboard/page.tsx` | Server Component | Static |
| `/map` | `app/map/page.tsx` | Client (useEffect) | Leaflet map |
| `/bank` | `app/bank/page.tsx` | Client (useEffect) | Transfers, pagination |
| `/company/new` | `app/company/new/page.tsx` | Client | Form avec preview |
| `/company/[id]` | `app/company/[id]/page.tsx` | Server Component | Static |
| `/profile` | `app/profile/page.tsx` | Client (useEffect) | Edit displayName |
| `/suggestions` | `app/suggestions/page.tsx` | Client (useEffect) | Vote, filters, modal |

### Middleware Behavior
- **Redirects** `/auth/*` → `/dashboard` si authentifié
- **Redirects** `/dashboard`, `/map`, `/bank`, `/company/*`, `/profile`, `/suggestions` → `/auth/login` si non authentifié

## Components

### GlassCard
```typescript
interface GlassCardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}
```
- **Style**: `backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl`
- **Usage**: Wrapper pour toutes les cards

### OrbeCurrency
```typescript
interface OrbeCurrencyProps {
  amount: bigint | number
  className?: string
  showDecimals?: boolean  // default: true
}
```
- **Format**: `◎ 1 000,00` (format français)
- **Conversion**: Centimes → Orbes avec 2 décimales

### Sidebar
- **Fixed**: Left sidebar, 16rem width
- **Navigation**: Dashboard, Map, Bank, Company, Suggestions, Profile
- **Active State**: Violet highlight avec border
- **Logout**: Server Action dans un `<form>`

## Environment Variables

### Required
| Variable | Source | Usage |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings | Server only (admin ops) |
| `DATABASE_URL` | Supabase Connection String | Prisma |

### Optional
| Variable | Default | Usage |
|----------|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Auth callbacks |

## Business Rules

### Monnaie
- **Unité**: Orbe (◎)
- **Stockage**: Centimes d'Orbe (BigInt)
- **Conversion**: `1 Orbe = 100 centimes`
- **Affichage**: `◎ 1 000,00` (format FR)

### Onboarding
1. **Step 1**: Email, password, username (unique, immutable)
2. **Step 2**: firstName, lastName, displayName auto-généré
3. **Step 3**: Sélection résidence parmi unlocked locations
- **Bonus**: +◎ 1 000,00 crédité automatiquement

### Entreprises
- **Capital Minimum**: ◎ 300,00
- **Maximum**: Aucun (pour l'instant)
- **Transaction**: Capital transféré du compte perso → compte entreprise
- **Location**: Héritée de la résidence du créateur

### Système de Déblocage
| Zone | Membres Requis |
|------|---------------|
| Nova | 0 (départ) |
| Aurora | 100 |
| Solara | 500 |
| Lunaris | 1000 |

### Suggestions
- **Statuts**: `PENDING` → `ACCEPTED`/`REJECTED` → `IMPLEMENTED`
- **Voting**: 1 vote par user par suggestion
- **Tri**: Date ou popularité

## Security Considerations

### Auth
- Supabase Auth gère les sessions (cookies httpOnly)
- Middleware vérifie l'authentification sur chaque requête protégée
- CSRF protection via Supabase SSR

### Data Access
- Server Actions vérifient toujours l'ownership (userId match)
- Prisma transactions atomiques pour les opérations financières
- Pas d'exposition de données sensibles (service role key côté server uniquement)

### Input Validation
- Tous les formulaires ont validation côté client ET serveur
- Sanitization via Prisma (SQL injection safe)
- Rate limiting: À implémenter (Vercel Edge Config ou Supabase)

## Future Improvements (Roadmap)

### Phase 2
- [ ] Système de marché (achat/vente entre joueurs)
- [ ] Mécaniques de production (ressources, stock)
- [ ] Système d'employés

### Phase 3
- [ ] Bourse / trading
- [ ] Notifications temps réel (Supabase Realtime)
- [ ] Chat entre joueurs

### Phase 4
- [ ] Guildes/Alliances
- [ ] Événements saisonniers
- [ ] API publique pour intégrations

## Debugging & Development

### Prisma Studio
```bash
npx prisma studio
# Accessible sur http://localhost:5555
```

### Logs
- Prisma: Activé en développement (`query`, `error`, `warn`)
- Supabase: Dashboard Supabase → Logs

### Common Issues

#### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

#### "Database connection error"
- Vérifier `DATABASE_URL` dans `.env.local`
- Vérifier IP allowlist dans Supabase

#### "Auth session not found"
- Vérifier `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vérifier cookies activés dans le navigateur

## Deployment Checklist

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Database migrations appliquées
- [ ] Seed exécuté (`npx prisma db seed`)
- [ ] Supabase Auth redirect URLs configurées (site URL + callbacks)
- [ ] Tests manuels: inscription complète → création entreprise → transfert
