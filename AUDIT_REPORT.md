# 🔍 Rapport d'Audit Ørbis - Bugs et Problèmes d'Affichage

**Date de l'audit :** 11 Avril 2026  
**Version du projet :** 0.1.0  
**Stack :** Next.js 16.2.2 + React 19.2.4 + TypeScript + Prisma + Supabase

---

## 🚨 BUGS CRITIQUES (à corriger immédiatement)

### 1. Google Sign In - Redirection non fonctionnelle
**Fichier :** `@/components/GoogleSignInButton.tsx`  
**Sévérité :** CRITIQUE

**Problème :** La server action `signInWithGoogle()` retourne une URL OAuth, mais le composant client ne fait rien avec cette URL. L'utilisateur ne peut pas se connecter via Google.

**Code problématique :**
```tsx
async function handleClick() {
  setLoading(true)
  try {
    await signInWithGoogle() // Retourne URL mais pas utilisée !
  } catch (error) {
    console.error('Google sign in error:', error)
    setLoading(false)
  }
  // La redirection est gérée par la server action ← FAUX
}
```

**Solution :** Le client doit rediriger vers l'URL retournée par la server action.

---

### 2. Route de déconnexion inexistante
**Fichier :** `@/components/Sidebar.tsx:80`  
**Sévérité :** CRITIQUE

**Problème :** Le formulaire de logout pointe vers `/api/auth/logout` mais cette route API n'existe pas.

**Code problématique :**
```tsx
<form action="/api/auth/logout" method="POST"> ← Route inexistante
```

**Solution :** Créer une API route `/api/auth/logout` ou utiliser une server action avec `formAction`.

---

### 3. Dépendance lucide-react incompatible avec React 19
**Fichier :** `package.json`  
**Sévérité :** CRITIQUE

**Problème :** `lucide-react@^1.7.0` est incompatible avec React 19. Cela provoque des erreurs de rendu et des icônes absentes.

**Solution :** Mettre à jour vers `lucide-react@^0.487.0` (dernière version compatible React 19).

---

## ⚠️ BUGS MAJEURS

### 4. Problèmes de sérialisation BigInt
**Fichiers :** `@/app/dashboard/page.tsx`, `@/components/StockChart.tsx`, `@/lib/currency.ts`  
**Sévérité :** MAJEUR

**Problème :** Les montants sont stockés en `BigInt` (centimes) mais ne sont pas correctement sérialisés lors du transfert Server → Client Component. Next.js ne peut pas sérialiser nativement `BigInt` en JSON.

**Impact :** Erreurs lors du rendu des graphiques et des soldes.

**Solution :** Convertir les BigInt en string ou number avant le passage aux Client Components.

---

### 5. React-Leaflet potentiellement incompatible
**Fichier :** `@/components/MapClient.tsx`  
**Sévérité :** MAJEUR

**Problème :** `react-leaflet@^5.0.0` n'a pas été testé avec React 19. Risque d'erreurs de rendu côté client.

**Solution :** Vérifier la compatibilité ou ajouter un SSR guard.

---

### 6. Recharts potentiellement incompatible
**Fichier :** `@/components/StockChart.tsx`  
**Sévérité :** MAJEUR

**Problème :** `recharts@^3.8.1` peut avoir des problèmes avec React 19, notamment avec le rendu des tooltips et la gestion des états.

---

## 🎨 BUGS D'AFFICHAGE

### 7. Classe CSS `pb-safe` non définie
**Fichier :** `@/components/BottomNav.tsx:37`  
**Sévérité :** MOYEN

**Problème :** La classe `pb-safe` est utilisée pour le safe area sur iOS mais n'est pas définie dans Tailwind ou le CSS global.

**Code problématique :**
```tsx
<nav className="... pb-safe">
```

**Solution :** Ajouter la classe dans `globals.css` ou utiliser une valeur arbitraire Tailwind.

---

### 8. Hydration mismatch potentiel dans UserCounter
**Fichier :** `@/components/UserCounter.tsx` (si présent)  
**Sévérité :** MOYEN

**Problème :** Si le compteur est rendu côté serveur puis hydraté côté client avec une valeur différente, cela cause des erreurs de hydration.

---

## 📝 PROBLÈMES DE CODE

### 9. Import incorrect dans auth.ts
**Fichier :** `@/app/actions/auth.ts:12`  
**Sévérité :** MOYEN

**Problème :** L'import utilise `@/lib/supabase` mais le fichier est `@/lib/supabase-server`.

**Code problématique :**
```ts
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase'
```

**Solution :** Corriger l'import vers `@/lib/supabase-server`.

---

### 10. Logs console dans le middleware
**Fichier :** `@/middleware.ts:45-50`  
**Sévérité :** FAIBLE

**Problème :** Les logs console dans le middleware peuvent causer des problèmes de performance et polluer les logs en production.

---

## 🔧 RECOMMANDATIONS GÉNÉRALES

### Compatibilité Next.js 16 + React 19
1. Vérifier tous les composants client avec des hooks pour les incompatibilités React 19
2. Les Server Actions doivent retourner des données sérialisables (pas de BigInt, pas de fonctions)
3. Utiliser `use()` pour déballer les Promises dans les composants React 19

### Performance
1. Ajouter des `loading.tsx` pour les routes lentes
2. Utiliser `React.Suspense` autour des composants lourds (Map, Charts)
3. Optimiser les requêtes Prisma avec `select` plutôt que `include` quand possible

### Sécurité
1. Valider toutes les entrées utilisateur avec Zod côté serveur
2. Sanitiser les données avant affichage (protection XSS)
3. Ajouter rate limiting sur les Server Actions sensibles

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Google Sign In fonctionne correctement
- [ ] Déconnexion fonctionne correctement
- [ ] Les icônes s'affichent partout
- [ ] La carte s'affiche sans erreur
- [ ] Les graphiques s'affichent sans erreur
- [ ] Les montants en Orbe s'affichent correctement
- [ ] Pas d'erreurs de hydration
- [ ] Navigation mobile fluide (bottom nav)
- [ ] Pas de console errors en production

---

## 📋 RÉSUMÉ DES CORRECTIONS À APPLIQUER

1. **GoogleSignInButton.tsx** - Gérer la redirection OAuth
2. **Sidebar.tsx** - Corriger la déconnexion (créer API route ou server action)
3. **package.json** - Mettre à jour `lucide-react` vers ^0.487.0
4. **app/actions/auth.ts:12** - Corriger l'import supabase
5. **globals.css** - Ajouter classe `.pb-safe`
6. **lib/currency.ts** - Gérer la sérialisation BigInt
7. **middleware.ts** - Retirer les logs en production

---

*Généré automatiquement par l'audit Ørbis*
