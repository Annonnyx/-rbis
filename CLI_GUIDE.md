# CLI Installation Guide

## Supabase CLI

L'installation globale via npm n'est pas supportée. Utilisez l'une de ces méthodes :

### macOS (Homebrew)
```bash
brew install supabase
```

### macOS/Linux (Direct)
```bash
# Télécharger la dernière version
curl -fsSL "https://github.com/supabase/cli/releases/latest/download/supabase_$(uname -s)_$(uname -m).tar.gz" | tar xz -C /usr/local/bin
```

### ou via npm local (recommandé)
```bash
npm install --save-dev supabase
npx supabase --version
```

## Vercel CLI

L'installation a probablement réussi. Vérifiez :
```bash
vercel --version
```

Sinon, réinstallez :
```bash
npm install -g vercel
```

## Commandes Utiles

### Supabase
```bash
# Lancer Supabase localement (Docker requis)
supabase start

# Status
supabase status

# Logs
supabase logs

# Link un projet existant
supabase link --project-ref <project-ref>

# DB Reset (attention: supprime tout!)
supabase db reset

# Push migrations
supabase db push
```

### Vercel
```bash
# Login
vercel login

# Lier le projet
vercel link

# Déployer (preview)
vercel

# Déployer (production)
vercel --prod

# Logs
vercel logs <deployment-url>

# Env variables
vercel env add KEY_NAME
vercel env ls
```

## Setup Projet Supabase

1. Créer un projet sur https://app.supabase.com
2. Copier les credentials (Settings > API)
3. Remplir `.env.local`
4. Lancer les migrations Prisma

## Setup Vercel

1. `vercel login`
2. `vercel link` (crée le projet)
3. Configurer les env vars sur le dashboard ou via CLI
4. `vercel --prod` pour le premier déploiement
