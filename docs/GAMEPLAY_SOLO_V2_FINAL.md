# ØRBIS - Gameplay Solo V2.0
## Plan Complet et Détaillé (Version Finale)

**Objectif** : Transformer Ørbis en une expérience solo immersive avec progression jusqu'au Top 1 Forbes.

**Durée de vie visée** : 40-60h pour atteindre la 1ère place mondiale.
**Objectif final** : Fortune de 1.000.000.000Ø et rang 1 du Forbes Ørbis.

**Choix validés** :
- ✅ Comptabilité réaliste (détaillée)
- ✅ Seul sur le marché (pas de concurrence IA agressive)
- ✅ Multi-types d'entreprises autorisés
- ✅ Google Maps réel pour placement
- ✅ Revenus entreprises : argent/h précis et suffisant
- ✅ Négociations simplifiées (4 options max)
- ✅ Classement Forbes avec 100 personnages inspirés réels
- ✅ Trading bourse complet + crypto
- ✅ 7 types d'entreprises avec mécaniques profondes

---

## 🎯 VISION GLOBALE & OBJECTIF FINAL

### Concept Central
Le joueur commence avec **500Ø** (suffisant pour démarrer immédiatement) et doit gravir les échelons pour atteindre la **1ère place du classement Forbes Ørbis** avec **1 milliard Ø (1.000.000.000Ø)**.

### Les 5 Phases de Progression

| Phase | Nom | Capital Objectif | Durée estimée | Débloque |
|-------|-----|------------------|---------------|----------|
| 1 | **Apprenti** | 500Ø → 5.000Ø | 30-45 min | Mini-jeux, 1ère entreprise |
| 2 | **Entrepreneur** | 5k → 100kØ | 2-4h | Trading bourse, Crypto |
| 3 | **Millionnaire** | 100k → 10MØ | 8-15h | Holding, International |
| 4 | **Milliardaire** | 10M → 500MØ | 20-30h | OPA, Trading pro |
| 5 | **Top 1 Forbes** | 500M → 1BØ | 10-15h | **VICTOIRE** |

---

## 📚 SYSTÈME DE TUTORIEL PROGRESSIF

### Phase 1 : Onboarding (0-15 min)
**Contexte** : Le joueur arrive dans la ville d'Ørbis avec **500Ø** et un petit appartement en banlieue.

**Objectifs guidés** :
1. **Découverte de la carte** (3 min)
   - Google Maps avec marqueurs des zones économiques
   - Zoom sur quartiers : Résidentiel, Commercial, Industriel, Financier
   - Explication : chaque zone = opportunités différentes
   - Coût de la vie varie selon les quartiers
   
2. **Premiers revenus** (5 min)
   - Mini-jeu "Livraison express" (tutorial)
   - Explication système énergie/stamina
   - Gain : 150Ø en 5 minutes de jeu
   
3. **Économie de base** (2 min)
   - Acheter un repas (-20Ø, +40 énergie)
   - Comprendre le cycle : Dépense énergie → Gagne argent → Consomme → Répète
   
4. **Navigation UI** (5 min)
   - Découverte des 5 écrans principaux : Accueil, Entreprises, Trading, Profil, Carte
   - Système de notifications (alertes revenus, objectifs)
   - Bouton "Conseiller" (aide contextuelle toujours disponible)

### Phase 2 : Travailleur (15 min - 1h)
**Objectif** : Atteindre 3.000-5.000Ø pour créer la première entreprise.

**Tableau des Mini-Jeux Débloqués** :

| Mini-jeu | Débloqué à | Revenu/h | Énergie/tour | Durée tour | Cooldown |
|----------|-----------|----------|--------------|------------|----------|
| **Livraison à pied** | Démarrage | 150Ø/h | 15 pts | 2 min | Aucun |
| **Courses urbaines** | Démarrage | 200Ø/h | 20 pts | 3 min | Aucun |
| **Livraison vélo** | 300Ø acquis | 400Ø/h | 25 pts | 5 min | Aucun |
| **Vendeur ambulant** | 600Ø acquis | 500Ø/h | 30 pts | 4 min | Aucun |
| **Freelance digital** | 1.000Ø acquis | 600Ø/h | 35 pts | 6 min | Aucun |
| **Chauffeur VTC** | 2.000Ø acquis | 800Ø/h | 40 pts | 5 min | Aucun |

**Système d'Énergie Détaillé** :
- **Énergie max** : 100 points
- **Régénération** : 20 points/heure (temps réel)
- **Régénération boost** : Nourriture instantanée (+40 pts pour 20Ø)
- **Stratégie** : Optimiser le coût énergie vs gain

**Calcul de progression** :
- En 30 min actif : 4-5 tours de mini-jeux = 600-800Ø gagnés
- Avec les 500Ø de départ : capital de 1.100-1.300Ø
- En 45 min : 1.500-2.000Ø
- En 1h : 3.000-5.000Ø (objectif entreprise atteint)

### Phase 3 : Entrepreneur (1h+)
**Déverrouillage** : Création d'entreprise disponible à partir de 3.000Ø.

**Tutoriel création d'entreprise** :
1. Choisir le type parmi disponibles
2. Choisir l'emplacement sur Google Maps
3. Définir la Direction Artistique (DA)
4. Embaucher le premier employé
5. Lancer les opérations

**Simulation guidée** (3 tours de tutoriel) :
- Tour 1 : Premières ventes, premiers revenus passifs
- Tour 2 : Gestion des stocks, recrutement
- Tour 3 : Optimisation, marketing, premiers bénéfices

---

## 🗺️ SYSTÈME DE PLACEMENT AVANCÉ (Google Maps)

### Vue Macro - Zones Économiques

La carte utilise **Google Maps réel** avec overlay des zones économiques colorées :

```typescript
interface ZoneEconomique {
  id: string;
  nom: string;
  type: 'residentiel' | 'commercial' | 'industriel' | 'financier' | 'portuaire' | 'aeroport';
  couleur: string; // Overlay sur la carte
  caracteristiques: {
    loyerMoyen: number; // Ø/m²/mois
    traficPietons: number; // 1-100
    coutVie: number; // Indice 100 = moyenne nationale
    mainOeuvreQualifiee: number; // % diplômés
    accessTransport: number; // 1-100
  };
  opportunites: string[]; // Types d'entreprises recommandés
}
```

**Zones disponibles (exemples villes)** :

| Zone | Type | Loyer | Trafic | Opportunités |
|------|------|-------|--------|--------------|
| **Paris 8ème** | Financier | 150Ø/m² | 95/100 | Banques, Luxe, Conseil |
| **Paris 11ème** | Résidentiel | 80Ø/m² | 70/100 | Commerces locaux, Services |
| **La Défense** | Commercial | 100Ø/m² | 85/100 | Bureaux, Corporate |
| **Zone industrielle Nord** | Industriel | 30Ø/m² | 40/100 | Logistique, Production |
| **Roissy** | Aéroport | 120Ø/m² | 60/100 | Compagnie aérienne, Cargo |
| **Port de Marseille** | Portuaire | 45Ø/m² | 50/100 | Import/export, Entreposage |

### Vue Micro - Emplacements Spécifiques

En zoomant sur une zone, accès aux emplacements précis :

```typescript
interface Emplacement {
  id: string;
  adresse: string; // Adresse réelle Google Maps
  coordonnees: { lat: number; lng: number };
  surface: number; // m²
  loyerMensuel: number;
  
  // Métriques clés
  traficPietons: number; // Passants/jour
  visibilite: number; // 1-100 (facade, angle rue)
  accessibilite: number; // Transport en commun
  concurrence: number; // Nb entreprises similaires dans 500m
  
  // Infrastructure
  parking: boolean;
  quaiDechargement: boolean;
  fibreOptique: boolean;
  climatisation: boolean;
  
  // Historique (fantôme anciens locataires)
  reputationLieu: number; // -10 à +10
  anciensLocataires: string[];
}
```

### Impact du Placement sur les Revenus

**Formule** : `Revenu/h de base × Multiplicateur emplacement`

| Emplacement | Multiplicateur | Exemple concret |
|-------------|----------------|-----------------|
| Excellent (centre commercial premium) | ×1.5 | 150Ø/h → 225Ø/h |
| Bon (rue commerçante) | ×1.2 | 150Ø/h → 180Ø/h |
| Moyen (quartier mixte) | ×1.0 | 150Ø/h = 150Ø/h |
| Faible (périphérie) | ×0.7 | 150Ø/h → 105Ø/h |
| Mauvais (zone industrielle isolée) | ×0.5 | 150Ø/h → 75Ø/h |

**Bonus de synergie** :
- Proximité entreprises complémentaires : +10% revenus
- Proximité concurrents directs : -20% revenus

---

## 💼 LES 7 TYPES D'ENTREPRISES - DÉTAIL COMPLET

### Structure de rentabilité commune

```typescript
interface Entreprise {
  // Identification
  id: string;
  nom: string;
  type: TypeEntreprise;
  proprietaireId: string;
  
  // Localisation
  emplacement: Emplacement;
  adresse: string;
  
  // Économie
  capitalInitial: number;
  chiffreAffaires: number; // Cumulé
  revenuHeure: number; // Calculé automatiquement
  
  // Coûts
  loyerMensuel: number;
  salairesMensuels: number;
  chargesExploitation: number; // Énergie, maintenance...
  
  // Ressources humaines
  employes: Employe[];
  nombreEmployes: number;
  masseSalariale: number;
  
  // Performance
  productivite: number; // 0.5 à 2.0
  satisfactionClient: number; // 0 à 100
  reputation: number; // -100 à +100
  
  // DA (Direction Artistique)
  positionnementPrix: 'discount' | 'accessible' | 'premium' | 'luxe';
  positionnementEthique: 'standard' | 'ecoresponsable' | 'equitable' | 'local';
  positionnementInnovation: 'traditionnel' | 'hybride' | 'innovant';
  
  // État
  dateCreation: Date;
  estActive: boolean;
  estRentable: boolean;
}
```

---

### 🧵 1. ENTREPRISE DE VÊTEMENTS (Retail)

#### Sous-types et Investissement

| Spécialisation | Coût Création | Revenu/h (démarrage) | Revenu/h (optimisé) | Marge | Difficulté |
|----------------|---------------|----------------------|---------------------|-------|------------|
| **Fast Fashion** | 1.000Ø | 80Ø/h | 200Ø/h | 15% | ★★☆ |
| **Prêt-à-porter** | 2.000Ø | 120Ø/h | 350Ø/h | 25% | ★★☆ |
| **Luxe & Haute couture** | 8.000Ø | 250Ø/h | 750Ø/h | 60% | ★★★★ |
| **Sportswear** | 1.500Ø | 100Ø/h | 280Ø/h | 20% | ★★☆ |
| **Éco-responsable** | 2.500Ø | 150Ø/h | 400Ø/h | 30% | ★★★ |

#### Mécaniques Spécifiques Détaillées

**Système de Collections** :
```typescript
interface Collection {
  id: string;
  nom: string;
  saison: 'printemps' | 'ete' | 'automne' | 'hiver';
  annee: number;
  pieces: PieceCollection[];
  budgetDesign: number; // Investissement initial
  prixVenteMoyen: number;
  stockInitial: number;
  stockActuel: number;
  vendus: number;
  
  // Métriques
  tendancePrediction: number; // 0-100 (mini-jeu recherche)
  buzzMedias: number; // Impact marketing
  qualitePerçue: number; // Impact satisfaction
}
```

**Cycle de vie d'une collection** :
1. **Design** (1 semaine jeu) : Investir 200-1.000Ø en recherche tendances
2. **Production** (2 semaines) : Commande aux ateliers, gestion délais
3. **Lancement** : Marketing + Mise en vente
4. **Vente** (8-12 semaines) : Dépend trafic emplacement + prix + qualité
5. **Soldes** (fin saison) : -30% à -50% sur invendus
6. **Destockage** : Pertes si trop d'invendus

**Chaîne d'Approvisionnement** :
```
Fournisseur Tissus → Atelier Couture → Contrôle Qualité → Entrepôt → Boutique
```

Options de sourcing :
| Type | Coût | Délai | Qualité | Impact DA |
|------|------|-------|---------|-----------|
| Asie (massif) | Bas | 4-6 sem | Standard | -10% "local" |
| Europe Est | Moyen | 2-3 sem | Bonne | Neutre |
| Production locale | Élevé | 1-2 sem | Excellente | +20% "local" |
| Atelier intégré | Très élevé | Immédiat | Maîtrisée | +15% contrôle |

**Marketing détaillé** :
- **Budget mensuel** : % du CA à définir (recommandé 10-20%)
- **Canaux** :
  - Réseaux sociaux : Gratuit mais lent, viralité possible
  - Influenceurs : 500-5.000Ø/post, impact immédiat
  - Publicité traditionnelle : 1.000-10.000Ø/mois, cible âgée
  - Événements (défilés) : 5.000-50.000Ø, buzz maximal
- **ROI marketing** : Suivi dans dashboard (coût d'acquisition client)

**Événements spécifiques** :
- **Buzz viral** : Collection qui cartonne (+300% ventes temporaire)
- **Scandale qualité** : Rappel produit, coût de crise
- **Contrefaçon** : Copies apparues, perte de valeur marque
- **Tendance surprise** : Couleur/motif inattendu qui explose

---

### ⚡ 2. VENTE DE BOISSONS ÉNERGISANTES

#### Sous-types et Investissement

| Type | Coût Création | Revenu/h (démarrage) | Revenu/h (optimisé) | Marge | Difficulté |
|------|---------------|----------------------|---------------------|-------|------------|
| **Artisanale/Local** | 2.000Ø | 120Ø/h | 350Ø/h | 25% | ★★☆ |
| **Industrielle** | 5.000Ø | 220Ø/h | 600Ø/h | 20% | ★★★★ |
| **Premium/Bio** | 3.000Ø | 180Ø/h | 550Ø/h | 35% | ★★★ |
| **Gaming/Esport** | 2.500Ø | 150Ø/h | 450Ø/h | 30% | ★★★ |

#### Mécaniques Spécifiques

**R&D et Formules** :
```typescript
interface FormuleBoisson {
  id: string;
  nom: string;
  composition: {
    cafeine: number; // mg/L
    taurine: number; // mg/L
    sucre: number; // g/L
    vitamines: string[];
    extras: string[]; // plantes, adaptogènes...
  };
  couts: {
    ingredients: number; // Ø/unité
    production: number; // Ø/unité
    total: number;
  };
  proprietes: {
    gout: number; // 0-100 (tests consommateurs)
    efficacite: number; // 0-100 (boost énergie)
    sante: number; // 0-100 (nutritionnistes)
  };
  brevete: boolean; // Protection juridique
}
```

**Processus de lancement d'une nouvelle boisson** :
1. **Recherche** (1-2 sem) : Études marché, tendances
2. **Formulation** (2-3 sem) : 5-10 tests, coût 500-2.000Ø
3. **Tests consommateurs** : Panels, ajustements
4. **Brevet** (optionnel) : 3.000Ø, protection 5 ans
5. **Validation sanitaire** : Normes obligatoires
6. **Production pilote** : Petit batch test marché
7. **Lancement commercial** : Marketing massif

**Production et Supply Chain** :
```typescript
interface UsineProduction {
  capaciteJour: number; // Unités/jour
  coutsFixes: number; // Loyer, maintenance
  coutsVariables: number; // Matières, énergie
  qualite: number; // Taux de défauts
  certifications: string[]; // Bio, Fairtrade...
}
```

Gestion des stocks :
- **Péremption** : 12-24 mois selon produit
- **Rotation** : FIFO (premier entré, premier sorti)
- **Prévisions** : Algorithme basé sur saisonnalité
- **Sécurité** : Stock minimum pour évuptures

**Distribution multi-canaux** :

**Canal B2B (60% du CA typique)** :
```typescript
interface ClientB2B {
  nom: string; // Restaurant, Gym, Supermarché...
  volumeMensuel: number;
  prixNegocie: number; // Remise volume
  delaiPaiement: number; // 30, 60, 90 jours
  fidelite: number; // Années de relation
  contractuel: boolean; // Engagement long terme
}
```

**Canal B2C (40% du CA)** :
- E-commerce propre : Site web, marketing digital
- Points de vente propres : Boutiques dédiées (coût élevé)
- Food trucks/stands : Flexible, événements
- Abonnement : Livraison régulière, fidélisation

**Risques spécifiques** :
- **Scandale sanitaire** : Rappel massif, coût crise communication
- **Concurrence agressive** : Géants du secteur baissent prix
- **Réglementation** : Nouvelle loi sur caféine/sucre
- **Pénurie matière** : Caféine, emballages

---

### 💻 3. INDUSTRIE TECHNOLOGIQUE (Hardware)

#### Sous-types et Investissement

| Type | Coût Création | Revenu/h (démarrage) | Revenu/h (optimisé) | Marge | Difficulté |
|------|---------------|----------------------|---------------------|-------|------------|
| **Composants électroniques** | 12.000Ø | 320Ø/h | 1.300Ø/h | 25% | ★★★★★ |
| **Périphériques** | 6.000Ø | 200Ø/h | 800Ø/h | 22% | ★★★★ |
| **IoT/Domotique** | 7.000Ø | 250Ø/h | 1.000Ø/h | 28% | ★★★★ |
| **Smartphones** | 25.000Ø | 650Ø/h | 2.500Ø/h | 20% | ★★★★★ |

#### Mécaniques Spécifiques

**Arbre Technologique** :
```typescript
interface Technologie {
  id: string;
  nom: string;
  niveau: number; // 1-5
  prerequis: string[]; // Techs nécessaires
  coutRecherche: number;
  dureeRecherche: number; // Semaines
  apport: {
    qualiteProduit: number;
    coutProduction: number; // Réduction
    nouveauMarche: boolean; // Nouvelle cible
  };
  brevete: boolean;
}
```

Exemples de technologies :
- **Niveau 1** : Circuits imprimés basiques, soudure automatique
- **Niveau 2** : Miniaturisation, premiers capteurs
- **Niveau 3** : Intelligence embarquée, IoT connecté
- **Niveau 4** : Processeurs custom, 5G intégré
- **Niveau 5** : IA matérielle, quantique expérimental

**Cycle de Produit Complet** :
```
Idée → Faisabilité → Prototype → Tests → Certification → 
Pré-production → Lancement → Production masse → 
Maintenance → Fin de vie (obsolescence)
```

**Détails par phase** :

1. **Faisabilité** (2-4 sem) : Étude technique, coût 1.000-5.000Ø
2. **Prototype** (4-8 sem) : 5-10 itérations, coût 5.000-50.000Ø
3. **Tests** (4-6 sem) : Qualité, durabilité, certifications
4. **Certifications** : CE, FCC (coût 5.000-20.000Ø)
5. **Pré-production** : 100-1000 unités tests marché
6. **Lancement** : Marketing, précommandes
7. **Production masse** : Économies d'échelle
8. **Obsolescence** : 18-36 mois, préparer remplaçant

**Qualité et Tests** :
```typescript
interface ControleQualite {
  tauxDefautsAcceptable: number; // Généralement < 1%
  tauxDefautsActuel: number;
  coutsRecalls: number; // Si problème
  coutsGarantie: number; // SAV
  satisfactionClient: number;
}
```

Processus de test :
- **Tests unitaires** : Chaque composant
- **Tests intégration** : Assemblage complet
- **Tests endurance** : Vieillissement accéléré
- **Tests utilisateurs** : Beta testing
- **Tests conformité** : Normes sécurité

**Écosystème et Dépendances** :
- Fournisseurs de composants critiques (puces, écrans)
- Risque pénurie mondiale (ex: semi-conducteurs)
- Contrats long terme avec fournisseurs clés
- Relations avec assembleurs (Foxconn-like)

---

### 💾 4. DÉVELOPPEMENT INFORMATIQUE (Software)

#### Sous-types et Investissement

| Type | Coût Création | Revenu/h (démarrage) | Revenu/h (optimisé) | Marge | Difficulté |
|------|---------------|----------------------|---------------------|-------|------------|
| **SaaS (Abonnement)** | 2.500Ø | 180Ø/h | 1.200Ø/h | 70% | ★★☆ |
| **Agence Web/Mobile** | 2.000Ø | 140Ø/h | 700Ø/h | 45% | ★★☆ |
| **Éditeur logiciel** | 4.000Ø | 250Ø/h | 1.400Ø/h | 60% | ★★★ |
| **Jeux vidéo** | 6.000Ø | 200Ø/h | 3.500Ø/h* | Variable | ★★★★ |
| **Cybersécurité** | 5.000Ø | 300Ø/h | 1.500Ø/h | 55% | ★★★ |

*Hit viral possible, sinon revenus faibles

#### Mécaniques Spécifiques

**Développement de Produit** :
```typescript
interface ProjetSoftware {
  nom: string;
  type: 'saas' | 'app' | 'game' | 'security';
  
  // Équipe
  chefsProjet: number;
  developpeurs: {
    seniors: number;
    juniors: number;
  };
  designers: number;
  testeurs: number;
  
  // Avancement
  backlogTotal: number; // Points de complexité
  backlogFait: number;
  sprints: Sprint[];
  
  // Qualité
  qualiteCode: number; // 0-100
  detteTechnique: number; // 0-100 (à rembourser)
  bugsCritiques: number;
  
  // Métriques
  dateLancement: Date;
  utilisateursActifs: number;
  revenusMensuels: number;
}
```

**Gestion de Projet Agile** :
- **Sprints** : 2 semaines de développement
- **Velocity** : Points d'complexité traités/sprint
- **Planification** : Backlog priorisé
- **Rétrospectives** : Amélioration continue

**Dette Technique** :
- Accrue quand on développe vite sans refactoring
- Impact : Bugs, lenteur, difficulté évolution
- Remboursement : Sprints dédiés refactoring
- Coût latent : 20% des sprints si dette élevée

**Modèle SaaS Avancé** :
```typescript
interface MetriquesSaaS {
  // Acquisition
  visiteursSite: number; // /mois
  tauxConversion: number; // % gratuit → payant
  coutsAcquisition: number; // Ø/client
  
  // Rétention
  churnRate: number; // % départs/mois
  lifetimeValue: number; // Ø gagnés/client
  netPromoterScore: number; // 0-100
  
  // Revenus
  monthlyRecurringRevenue: number; // MRR
  annualRecurringRevenue: number; // ARR
  expansionRevenue: number; // Upsells
  
  // Coûts
  coutsServeurs: number; // Échelle avec users
  coutsSupport: number; // Tickets, chat
}
```

**Marketing Digital** :
- **SEO** : Contenu, backlinks, 6-12 mois pour résultats
- **SEA** : Publicité payante, immédiat mais coûteux
- **Content marketing** : Blog, tutos, acquisition organique
- **Freemium** : Version gratuite limitée
- **API ouverte** : Développeurs tiers créent écosystème

**Événements spécifiques** :
- **Viralité** : Produit qui explose (+1000% utilisateurs)
- **Bug critique** : Perte données, crise confiance
- **Concurrence** : Géant lance produit similaire gratuit
- **Tech breakthrough** : Innovation majeure possible (R&D réussie)

---

### ✈️ 5. COMPAGNIE AÉRIENNE

#### Sous-types et Investissement

| Type | Coût Création | Revenu/h (démarrage) | Revenu/h (optimisé) | Marge | Difficulté |
|------|---------------|----------------------|---------------------|-------|------------|
| **Low-cost régional** | 20.000Ø | 650Ø/h | 2.000Ø/h | 15% | ★★★★ |
| **Traditionnelle** | 50.000Ø | 1.300Ø/h | 4.000Ø/h | 12% | ★★★★★ |
| **Charter/Vacances** | 30.000Ø | 1.000Ø/h | 3.000Ø/h | 18% | ★★★★ |
| **Cargo** | 35.000Ø | 800Ø/h | 3.200Ø/h | 20% | ★★★★ |

#### Mécaniques Spécifiques

**Flotte d'Avions** :
```typescript
interface Avion {
  modele: string; // A320, B737, A380...
  capacite: number; // Passagers ou tonnes cargo
  autonomie: number; // km
  vitesse: number; // km/h
  
  // Économie
  prixAchat: number;
  prixLocation: number; // Mensuel
  consommation: number; // L/100km
  
  // Maintenance
  heuresVol: number;
  derniereMaintenance: Date;
  prochaineRevision: Date;
  coutMaintenance: number; // /heure de vol
  etat: number; // 0-100%
}
```

**Stratégie Achat vs Leasing** :
| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **Achat** | Propriété, pas de loyer, revente | Immobilisation capital, obsolescence |
| **Leasing** | Flexibilité, mises à jour | Loyer récurrent, pas de valeur résiduelle |

**Planification des Vols** :
```typescript
interface Vol {
  numero: string;
  origine: string;
  destination: string;
  distance: number;
  
  // Temps
  depart: Date;
  arrivee: Date;
  dureeVol: number;
  
  // Économie
  avion: Avion;
  passagers: number;
  tauxRemplissage: number; // % sièges occupés
  
  // Revenus
  prixBilletMoyen: number;
  revenuCargo: number;
  revenuTotal: number;
  
  // Coûts
  coutCarburant: number;
  coutsAeroport: number; // Atterrissage, stationnement
  coutsEquipage: number;
}
```

**Yield Management (Tarification dynamique)** :
- Prix varient selon : Jour, Heure, Anticipation, Demande
- Classes : Économy (60%), Business (30%), First (10%)
- Revenus annexes : Bagages, repas, siège choisi, pub
- Overbooking : 5-10% pour compenser no-shows

**Régulation Aérienne** :
```typescript
interface SlotsAeroport {
  aeroport: string;
  creneauxJournaliers: number; // Limité
  prixCreneau: number; // Enchères ou fixes
  crenauxPossedes: number;
}
```

Contraintes réglementaires :
- **Slots** : Permis décollage/atterrissage limités (encheres)
- **Sécurité** : Normes OACI, audits réguliers
- **Environnement** : Quotas CO2, taxes émissions
- **Cabotage** : Droits de vol international

**Facteurs externes majeurs** :
- **Carburant** : 30% des coûts, fluctuation brutale
- **Météo** : Retards, annulations, déroutements
- **Événements** : Épidémies (choc demande), terrorisme
- **Saisonnalité** : Été (+40%), Hiver (-30%)

---

### 🚛 6. LOGISTIQUE & TRANSPORT

#### Sous-types et Investissement

| Type | Coût Création | Revenu/h (démarrage) | Revenu/h (optimisé) | Marge | Difficulté |
|------|---------------|----------------------|---------------------|-------|------------|
| **Messagerie express** | 4.000Ø | 160Ø/h | 600Ø/h | 18% | ★★★ |
| **Transport lourd** | 6.000Ø | 230Ø/h | 850Ø/h | 16% | ★★★ |
| **Entreposage** | 5.000Ø | 130Ø/h | 500Ø/h | 20% | ★★☆ |
| **Cross-docking** | 8.000Ø | 300Ø/h | 1.000Ø/h | 22% | ★★★★ |
| **Dernière mile** | 3.000Ø | 150Ø/h | 450Ø/h | 15% | ★★☆ |

#### Mécaniques Spécifiques

**Flotte de Véhicules** :
```typescript
interface VehiculeLogistique {
  type: 'camionnette' | 'camion_7t5' | 'semi_remorque' | 'van' | 'utilitaire';
  capaciteKg: number;
  capaciteM3: number;
  
  // Économie
  prixAchat: number;
  entretienMensuel: number;
  carburantAuKm: number; // Ø/km
  assuranceAnnuelle: number;
  
  // Opérationnel
  kilometrage: number;
  disponible: boolean;
  emplacement: string; // Dépôt ou route
  chauffeurAssigne: string;
}
```

**Optimisation des Tournées** :
```typescript
interface Tournee {
  vehicule: VehiculeLogistique;
  chauffeur: Chauffeur;
  pointsLivraison: PointLivraison[];
  
  // Optimisation
  distanceTotale: number; // km
  essenceConsommee: number; // L
  tempsTotal: number; // heures
  
  // Économie
  revenusLivraisons: number;
  coutsCarburant: number;
  margeTournee: number;
  
  // Efficacité
  tauxRemplissage: number; // % capacité utilisée
  retoursVide: number; // km sans chargement
}
```

**Algorithmique de tournées** :
- Problème du voyageur de commerce
- Contraintes : Fenêtres horaires clients, capacité véhicule, temps conducteur
- Objectif : Minimiser distance, maximiser remplissage
- Bonus : Consolidation de chargements

**Hubs et Entrepôts** :
```typescript
interface Entrepot {
  emplacement: Emplacement;
  surface: number; // m²
  hauteur: number; // mètres pour rackage
  
  // Capacité
  capacitePalettes: number;
  occupationActuelle: number;
  rotationStock: number; // jours
  
  // Équipement
  racks: boolean;
  systemeWMS: boolean; // Software gestion
  robots: number; // 0 à X robots automates
  
  // Équipe
  gestionnaires: number;
  manutentionnaires: number;
  caristes: number;
}
```

**Services de valeur ajoutée** :
- **Cross-docking** : Réception, tri, expédition sans stockage
- **Kitting** : Assemblage de kits pour clients
- **Labeling** : Étiquetage personnalisé
- **Quality check** : Contrôle qualité pour compte client
- **Last mile premium** : Livraison créneau horaire, weekend

---

### 🏢 7. AGENCE IMMOBILIÈRE

#### Sous-types et Investissement

| Type | Coût Création | Revenu/h (démarrage) | Revenu/h (optimisé) | Marge | Difficulté |
|------|---------------|----------------------|---------------------|-------|------------|
| **Transaction** | 3.000Ø | 100Ø/h | 400Ø/h | 100%* | ★★☆ |
| **Location/Gestion** | 2.500Ø | 80Ø/h | 300Ø/h | 50% | ★★☆ |
| **Promotion/Promoteur** | 25.000Ø | 350Ø/h | 1.400Ø/h | 25% | ★★★★ |
| **Investissement locatif** | 15.000Ø | 130Ø/h | 600Ø/h | 20% | ★★★ |
| **Commercial** | 7.000Ø | 170Ø/h | 650Ø/h | 40% | ★★★ |

*Commission sur vente, pas de stock

#### Mécaniques Spécifiques

**Portefeuille de Biens** :
```typescript
interface BienImmobilier {
  adresse: string;
  type: 'appartement' | 'maison' | 'bureau' | 'commerce' | 'entrepot';
  surface: number;
  
  // Valeur
  prixAchat: number;
  valeurActuelle: number; // Évolution marché
  plusValue: number;
  
  // Revenus (si location)
  loyerMensuel: number;
  loyerAuM2: number;
  rendementLocatif: number; // %/an
  
  // Occupation
  occupe: boolean;
  locataire: Locataire;
  vacance: number; // Jours sans locataire/an
  
  // Charges
  chargesCopropriete: number;
  taxeFonciere: number;
  travaux: number; // Entretien
  
  // Financement
  credit: {
    montant: number;
    mensualite: number;
    taux: number;
    restantDu: number;
  };
}
```

**Construction (Promoteur)** :
```typescript
interface ProjetConstruction {
  terrain: {
    adresse: string;
    surface: number;
    prix: number;
  };
  
  // Projet
  type: 'logements' | 'bureaux' | 'commerce' | 'mixte';
  nombreUnites: number;
  surfaceTotale: number;
  standing: 'social' | 'moyen' | 'haut' | 'luxe';
  
  // Déroulement
  phase: 'etude' | 'permis' | 'construction' | 'vente';
  avancement: number; // %
  dureeTotale: number; // Mois estimés
  
  // Économie
  coutConstruction: number;
  coutTotal: number;
  prixVentePrevisionnel: number;
  margePrevue: number;
  
  // Risques
  risquePermis: number; // % refus
  risqueRetard: number; // Mois dépassement
  risqueCout: number; // Dépassement budget
}
```

**Phases d'un projet immobilier** :
1. **Étude** (2-4 mois) : Faisabilité, sol, marché
2. **Permis de construire** (6-12 mois) : Risque de refus ou recours
3. **Construction** (18-36 mois) : Dépassements fréquents
4. **Commercialisation** (6-18 mois) : Vente des unités

**Marché Dynamique** :
```typescript
interface MarcheImmobilier {
  zone: string;
  
  // Prix
  prixMoyenAuM2: number;
  evolution12Mois: number; // %
  tendance: 'hausse' | 'stable' | 'baisse';
  
  // Demande
  delaiVenteMoyen: number; // Jours
  nombreTransactions: number; // /mois
  
  // Offre
  stockDisponible: number; // Biens en vente
  constructionsEnCours: number;
  
  // Facteurs
  tauxInteret: number; // Crédits immo
  pouvoirAchat: number; // Indice
  demographie: number; // Evolution population
}
```

**Gestion locative détaillée** :
- **Sélection locataires** : Scoring, garanties, cautions
- **Baux** : Durée, indexation, reconduction tacite
- **Impayés** : Procédures, assurances loyers impayés
- **Travaux** : Entretien locatif vs locataire
- **Vide locatif** : Pertes de revenus entre locataires

---

## 🎨 SYSTÈME DE DIRECTION ARTISTIQUE (DA)

### Positionnement Prix (4 choix)

| Position | Prix vs marché | Marge cible | Volume | Clientèle |
|----------|----------------|-------------|--------|-----------|
| **Discount** | -30% | 15% | Très élevé | Prix sensible |
| **Accessible** | Prix marché | 25% | Élevé | Grand public |
| **Premium** | +40% | 40% | Moyen | CSP+, qualité |
| **Luxe** | +150% | 60% | Faible | Very affluent |

**Impact multiplicateur sur revenu/h** :
- Discount : ×1.2 (volume compense marge)
- Accessible : ×1.0 (baseline)
- Premium : ×0.9 (moins de ventes mais marge)
- Luxe : ×0.6 (très peu de ventes, timing long)

### Positionnement Éthique (4 choix)

| Position | Impact Coûts | Impact Prix | Bonus | Malus |
|----------|--------------|-------------|-------|-------|
| **Standard** | Aucun | Aucun | - | - |
| **Éco-responsable** | +15% | +10% | Fidélité +20% | - |
| **Équitable** | +20% (salaires) | +5% | Productivité +15% | - |
| **Local** | +10% | +5% | Réputation +10% | -10% "exotique" |

### Positionnement Innovation (3 choix)

| Position | R&D requise | Risque | Récompense |
|----------|-------------|--------|------------|
| **Traditionnel** | Bas | Faible | Stable |
| **Hybride** | Moyen | Moyen | Croissance modérée |
| **Innovant** | Élevé (+30% investissement) | Élevé | ×2 potentiel si succès |

### Combinaisons Stratégiques Exemples

**"Luxe Éco-innovant"** :
- Prix très élevé, marge 60%
- Matériaux nobles durables
- Innovation design
- Marketing storytelling
- Revenu/h : Modeste mais valeur entreprise élevée

**"Discount Local Équitable"** :
- Prix cassés, volume extrême
- Circuit court
- Salaires décents
- Revenu/h : Élevé par volume

---

## � COMPTABILITÉ RÉALISTE DÉTAILLÉE

### Compte de Résultat Complet

```
╔════════════════════════════════════════════════════════════╗
║               COMPTE DE RÉSULTAT - [MOIS/ANNEE]            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  CHIFFRE D'AFFAIRES (Ventes)                         50.000Ø ║
║  - Remises, ristournes                                -2.000Ø ║
║  = CHIFFRE D'AFFAIRES NET                            48.000Ø ║
║                                                            ║
║  - COÛT DES MARCHANDISES VENDUES                     -20.000Ø ║
║    (Achats matières, production, logistique)               ║
║                                                            ║
║  = MARGE BRUTE                                       28.000Ø ║
║    (Taux de marge : 58%)                                   ║
║                                                            ║
║  - CHARGES OPERATIONNELLES                           -15.000Ø ║
║    ├── Salaires et charges sociales          -8.000Ø       ║
║    ├── Loyer et charges locatives            -2.500Ø       ║
║    ├── Énergie, eau, télécom                 -1.000Ø       ║
║    ├── Maintenance et réparations              -800Ø       ║
║    ├── Marketing et publicité                -1.500Ø       ║
║    ├── Assurances                              -500Ø       ║
║    ├── Frais de déplacement                      -400Ø       ║
║    └── Honoraires (comptable, avocat)          -300Ø       ║
║                                                            ║
║  - DOTATIONS AUX AMORTISSEMENTS                       -1.500Ø ║
║    (Bâtiments 2%, Équipement 20%, Véhicules 25%)           ║
║                                                            ║
║  = RÉSULTAT OPERATIONNEL (EBITDA)                    11.500Ø ║
║                                                            ║
║  - FRAIS FINANCIERS                                     -500Ø ║
║    (Intérêts emprunt bancaire)                             ║
║                                                            ║
║  + PRODUITS FINANCIERS                                  +100Ø ║
║    (Intérêts reçus, placements)                            ║
║                                                            ║
║  = RÉSULTAT AVANT IMPÔT                              11.100Ø ║
║                                                            ║
║  - IMPÔT SUR LES SOCIÉTÉS                             -2.775Ø ║
║    (Taux 25% sur bénéfice)                                 ║
║                                                            ║
║  = RÉSULTAT NET                                       8.325Ø ║
╚════════════════════════════════════════════════════════════╝
```

### Structure Juridique et Fiscalité

| Forme | Création | Régime | Avantages | Inconvénients |
|-------|----------|--------|-----------|---------------|
| **Auto-entreprise** | Gratuit | IR progressif | Ultra simple | Plafond 77kØ/an |
| **SARL** | 2.000Ø | IS 15-25% | Responsabilité limitée | Formelité |
| **SAS** | 3.000Ø | IS 25% | Flexible | Légerement plus cher |
| **Holding** | 15.000Ø | Optimisation groupe | Multi-sociétés | Complexe |

**Barème IS (Impôt Société)** :
- 15% sur bénéfice jusqu'à 42.500Ø
- 25% au-delà de 42.500Ø

**Optimisation Fiscale Avancée** :

| Structure | Multiplicateur Revenu/h | Description |
|-----------|------------------------|-------------|
| **Standard** | ×1.0 | Impôts classiques, pas d'optimisation |
| **SARL optimisée** | ×1.2 | Déductions, amortissements accélérés |
| **Holding + SARL** | ×1.4 | Défiscalisation groupe, réintégration |
| **Holding + structures offshores** | ×1.7 | Paradis fiscaux légaux, transfert pricing |

**Mécanique de Défiscalisation** :
```typescript
interface OptimisationFiscale {
  structureJuridique: 'auto' | 'sarl' | 'sas' | 'holding' | 'offshore';
  
  strategies: {
    deductions: string[]; // Frais professionnels, etc.
    amortissements: number; // % accéléré
    provisions: boolean; // Stocks dépréciés
    creditsImpots: boolean; // R&D, innovation
    offshore: boolean; // Société filiale paradis fiscal
    transfertPricing: boolean; // Facturation interne groupe
  };
  
  // Impact final
  tauxImpositionReel: number; // 0% à 25% selon optimisations
  multiplicateurRevenu: number; // 1.0 à 1.7
}
```

**Arbre d'Optimisation** :
1. **Niveau 1** (×1.2) : Déductions frais (restaurant, transport), amortissements accélérés
2. **Niveau 2** (×1.4) : Création Holding + déductions intérêts emprunts intragroupes
3. **Niveau 3** (×1.7) : Structure offshore (Malte, Luxembourg, Irlande) + transfert pricing + patents box

**Exemple concret ×1.7** :
- Entreprise nucléaire : 16.000Ø/h de base
- Avec optimisation max : 16.000 × 1.7 = **27.200Ø/h**
- Différence : +11.200Ø/h = +80.640.000Ø/mois supplémentaires !

**Coûts d'optimisation** :
- Structuration Holding : 15.000Ø + 5.000Ø/an
- Setup offshore : 50.000Ø + 20.000Ø/an
- Audit/compliance : 10.000Ø/an

**Risques** :
- Contrôle fiscal (si trop agressif)
- Réputation (scandale si révélé)
- Changement loi (réforme fiscale)

---

## 💸 TRADING AVANCÉ (BOURSE + CRYPTO)

### Système Bourse Ørbis

**Déblocage** : À 5.000Ø de capital personnel

**Actifs disponibles** :

| Catégorie | Exemples | Volatilité | Rendement typique |
|-----------|----------|------------|-------------------|
| **Actions** | Tech, Industrie, Services | ±5%/jour | 8-15%/an |
| **ETF** | Secteurs, Indices | ±3%/jour | 6-10%/an |
| **Obligations** | État Ørbis, Corporate | ±1%/jour | 3-6%/an |
| **Matières** | Or, Pétrole, Blé | ±4%/jour | Variable |
| **Forex** | Ø/EUR, Ø/USD | ±2%/jour | 5-10%/an |

### Système Crypto Ørbis

**Déblocage** : À 10.000Ø

| Coin | Prix départ | Volatilité | Staking | Mining |
|------|-------------|------------|---------|--------|
| **ØRB** | 1Ø | Faible | 3% | Non |
| **BitGold** | 50.000Ø | Élevée | 5% | Oui (coûteux) |
| **Ethereum++** | 3.000Ø | Très élevée | 8% | Oui |
| **SpeedCoin** | 0.1Ø | Extrême | 12% | Non |
| **GreenToken** | 5Ø | Moyenne | 6% | Oui (éco) |

**Stratégies de Trading** :

| Stratégie | Capital | Temps/jour | Risque | Rendement |
|-----------|---------|------------|--------|-----------|
| **Buy & Hold** | 1.000Ø+ | 5 min | Faible | 10%/an |
| **Swing** | 5.000Ø+ | 30 min | Moyen | 30%/an |
| **Day Trading** | 20.000Ø+ | 3h | Élevé | 80%/an |
| **Arbitrage** | 50.000Ø+ | 1h | Faible | 15%/an |

---

## 📊 CLASSEMENT FORBES ØRBIS

### Les 100 Personnages (Sélection)

| Rang | Nom | Fortune | Entreprise | Secteur | Ville |
|------|-----|---------|------------|---------|-------|
| 1 | **Elon R. Mask** | 1.0BØ | SpaceLink | Tech | Austin |
| 2 | **Jeff B. Zos** | 980MØ | E-Commerce Global | Retail | Seattle |
| 3 | **Bernard A. Arno** | 920MØ | LVMH Group | Luxe | Paris |
| 4 | **Bill G. Foundation** | 890MØ | SoftMicro | Tech | Medina |
| 5 | **Warren B. Fett** | 850MØ | BerkInvest | Finance | Omaha |
| 10 | **Steve B. Malon** | 690MØ | SoftMicro | Tech | Seattle |
| 25 | **Pierre O. Midyar** | 350MØ | AuctionNet | Tech | Las Vegas |
| 50 | **Daniel E. Ek** | 180MØ | StreamMusic | Tech | Stockholm |
| 75 | **Brian C. Acton** | 95MØ | TalkApp | Tech | Mountain View |
| 100 | **Thomas D. Wealth** | 5MØ | Local Business | Services | Peoria |

**Progression IA** : +0.5% à 2% par mois selon rang

**Objectif joueur** : Passer du rang 10.000+ au rang 1 en 40-60h

### Calcul de Fortune Personnelle

```typescript
interface FortuneTotale {
  // Liquide
  comptesBancaires: number;
  
  // Placements
  portefeuilleActions: number;
  obligations: number;
  crypto: number;
  
  // Immobilier
  biensPropres: number;
  
  // Entreprises
  valeurEntreprises: number; // Évaluation comptable
  
  // Total
  total: number;
}
```

---

## 🎲 SYSTÈME D'ÉVÉNEMENTS ALÉATOIRES

### Fréquence et Impact

| Type | Fréquence | Impact | Gestion |
|------|-----------|--------|---------|
| **Opportunité** | 1/mois | +20% revenus semaine | Acceptation |
| **Panne** | 1/mois | -10% revenus 3 jours | Réparation |
| **Buzz** | 1/3 mois | +50% ventes 2 sem | Profiter |
| **Crise** | 1/6 mois | -30% revenus mois | Gestion |
| **Scandale** | 1/an | -50% réputation | Communication |

### Exemples d'Événements

**Positifs** :
- Collection virale (+300% ventes)
- Employé exceptionnel découvert
- Partenariat inattendu
- Innovation réussie

**Négatifs** :
- Pénurie matière première (+30% coûts)
- Grève (arrêt 1 semaine)
- Concurrence prix cassés
- Incident sécurité
- Crise économique mondiale

---

## 💱 SYSTÈME DE NÉGOCIATION (Simplifié)

### Interface Rapide

```typescript
interface Negociation {
  proposition: number;
  marge: number; // ±20%
  
  options: [
    "Accepter",
    "Refuser",
    "Contre -10%",
    "Contre +10% (qualité)"
  ];
}
```

**Exemple** : Fournisseur propose 100Ø/unité
- Accepter → 100Ø
- Contre -10% → 90Ø (80% réussite si volume)
- Contre +10% → 110Ø (qualité premium)

**Compétence Négociation** : +5% réussite par niveau

---

## 🔧 ROADMAP IMPLEMENTATION

### Phase 1 : Système de Revenus (2 semaines)
- [ ] 6 mini-jeux early game
- [ ] Système énergie/stamina
- [ ] Inventaire consommables
- [ ] Google Maps placement

### Phase 2 : Première Entreprise (2 semaines)
- [ ] Template entreprise générique
- [ ] Revenus passifs Ø/h
- [ ] Gestion employés basique
- [ ] Comptabilité simplifiée

### Phase 3 : 7 Types Complets (3 semaines)
- [ ] Vêtements avec collections
- [ ] Boissons avec R&D
- [ ] Tech hardware
- [ ] Software SaaS
- [ ] Compagnie aérienne
- [ ] Logistique flotte
- [ ] Immobilier construction

### Phase 4 : Trading & Finance (2 semaines)
- [ ] Bourse complète
- [ ] Crypto 5 coins
- [ ] Classement Forbes 100 IA
- [ ] Optimisation fiscale

### Phase 5 : Polish (2 semaines)
- [ ] Équilibrage économique
- [ ] Événements aléatoires
- [ ] Tutorial complet
- [ ] Tests & bugs

**Total** : 11 semaines (~3 mois)

---

## 📈 TABLEAUX D'ÉQUILIBRAGE

### Progression Joueur Optimisé

| Heure jeu | Source | Revenu cumulé | Rang Forbes |
|-----------|--------|---------------|-------------|
| 0h | Démarrage | 500Ø | 10.000+ |
| 0.5h | Mini-jeux | 1.500Ø | 5.000 |
| 1h | Entreprise | 5.000Ø | 2.000 |
| 2h | Entreprise+ | 20.000Ø | 800 |
| 4h | Multi | 100.000Ø | 200 |
| 8h | Empire | 500.000Ø | 50 |
| 15h | Trading | 5.000.000Ø | 20 |
| 30h | Pro | 200.000.000Ø | 10 |
| 50h | Top | 1.000.000.000Ø | **1** |

### Multiplicateurs de Revenu/h

| Facteur | Impact | Comment optimiser |
|---------|--------|-------------------|
| Emplacement | ×0.5 à ×1.5 | Choisir zone premium |
| Employés | ×0.7 à ×1.7 | Recruter seniors |
| Marketing | ×0.9 à ×1.3 | Budget adapté |
| DA | ×0.6 à ×1.2 | Positionnement luxe |
| Événements | ×0.5 à ×2.0 | Gérer crises |
| **Optimisation fiscale** | **×1.0 à ×1.7** | **Holding, offshore, défiscalisation** |

**Multiplicateur global maximum** : ×1.5 × 1.7 × 1.3 × 1.2 × 2.0 × 1.7 = **×14.2**

---

## 🎰 MINI-JEUX : SOURCES INSTANTANÉES (Plafonnées)

**Correction importante** : Les mini-jeux ne donnent pas de Ø/h mais des **gains ponctuels**.

| Mini-jeu | Gain instantané | Temps | Énergie | Cooldown |
|----------|-----------------|-------|---------|----------|
| **Livraison à pied** | 50-150Ø | 2 min | 15 pts | 10 min |
| **Courses urbaines** | 80-200Ø | 3 min | 20 pts | 10 min |
| **Livraison vélo** | 150-400Ø | 5 min | 25 pts | 15 min |
| **Vendeur ambulant** | 200-500Ø | 4 min | 30 pts | 15 min |
| **Freelance digital** | 300-600Ø | 6 min | 35 pts | 20 min |
| **Chauffeur VTC** | 400-800Ø | 5 min | 40 pts | 20 min |

**PLAFOND GLOBAL** : **2.000Ø maximum** via mini-jeux.

Une fois le plafond atteint : mini-jeux grisés, message :
> *"Vous avez maximisé les gains via mini-jeux. Créez une entreprise pour générer des revenus passifs Ø/h illimités !"*

**Objectif** : Forcer la transition vers les entreprises après 30-60 min.

---

## 🏢 TYPES D'ENTREPRISES ADDITIONNELS (+15 types)

En complément des 7 types détaillés précédemment :

### 8. CASINO & HOTELLERIE (Nouveau)

**Sous-types** :
| Type | Coût | Revenu Ø/h | Spécificité |
|------|------|------------|-------------|
| **Casino local** | 15.000Ø | 500-2.000Ø | Jeux de hasard, licence |
| **Hôtel 3★** | 10.000Ø | 350-1.000Ø | Tourisme business |
| **Hôtel 5★ luxe** | 50.000Ø | 1.300-4.000Ø | Clientèle premium |
| **Resort** | 80.000Ø | 1.600-5.000Ø | Complexe loisirs |
| **Salle de spectacle** | 20.000Ø | 650-2.500Ø | Événements, concerts |

**Mécanique de GENTRIFICATION** :
```typescript
interface ImpactImmobilier {
  rayon: number; // mètres autour de l'établissement
  multiplicateurPrix: number; // 1.0 → 3.0
  
  phases: {
    ouverture: number; // 1.0 (prix normaux)
    mois3: number; // 1.3 (+30%)
    mois6: number; // 1.6 (+60%)
    annee1: number; // 2.0 (+100%)
    annee2: number; // 2.5 (+150%)
    annee3: number; // 3.0 (+200%)
  };
}
```

**Stratégie Casino + Immobilier** :
1. Acheter terrains/appartements autour à prix bas **AVANT** ouverture
2. Ouvrir casino/hôtel
3. Attendre gentrification (prix ×2-3)
4. Revendre immeubles avec plus-value massive
5. Répéter dans nouvelle zone

**Exemple concret** :
- Achat 5 appartements à 50.000Ø chacun (total 250.000Ø)
- Ouverture casino 5★
- 3 ans plus tard : appartements valent 150.000Ø chacun
- Plus-value : 500.000Ø (hors revenus casino)

---

### 9. INDUSTRIE LOURDE & MANUFACTURIÈRE

**Sous-types** :
| Type | Coût | Revenu Ø/h | Description |
|------|------|------------|-------------|
| **Automobile** | 100.000Ø | 3.200-8.000Ø | Usine voitures |
| **Chimie/Pharma** | 80.000Ø | 2.500-6.500Ø | Médicaments, produits |
| **Métallurgie** | 60.000Ø | 2.000-5.000Ø | Acier, aluminium |
| **Textile industriel** | 20.000Ø | 650-1.600Ø | Production masse |
| **Agroalimentaire** | 30.000Ø | 1.000-2.500Ø | Transformation aliments |

**Stratégie Usine + Logements Ouvriers** :
```typescript
interface DeveloppementRural {
  villageInitial: {
    population: number; // 500-2000 habitants
    prixTerrain: number; // Ø/m² très bas
    chomage: number; // % élevé
  };
  
  usine: {
    creation: number; // 1000+ emplois
    salaires: number; // supérieur local
  };
  
  evolution: {
    mois6: "Premiers ouvriers arrivent";
    annee1: "Maisons construites, population ×2";
    annee2: "Commerces s'installent, prix ×2.5";
    annee3: "Ville dynamique, prix ×4";
  };
}
```

**Tactique** :
1. Acheter terrains autour du village (prix ridicule : 5-10Ø/m²)
2. Construire usine (apport emplois)
3. Construire lotissement ouvriers
4. Vendre maisons aux employés (crédit immobilier)
5. Terrains valent maintenant 40-50Ø/m²

---

### 10. ENERGIE & UTILITIES

| Type | Coût | Revenu Ø/h | Description |
|------|------|------------|-------------|
| **Énergie solaire** | 25.000Ø | 500-1.300Ø | Parc photovoltaïque |
| **Éolien** | 40.000Ø | 800-2.000Ø | Éoliennes terrestres |
| **Pétrole/Gaz** | 200.000Ø | 8.000-24.000Ø | Extraction, raffinage |
| **Nucléaire** | 500.000Ø | 16.000-48.000Ø | Centrale (régulation stricte) |
| **Distribution eau** | 30.000Ø | 650-1.600Ø | Monopole local |

---

### 11. MÉDIAS & DIVERTISSEMENT

| Type | Coût | Revenu Ø/h | Description |
|------|------|------------|-------------|
| **Chaîne TV** | 50.000Ø | 1.300-3.200Ø | Publicité, abonnements |
| **Radio** | 10.000Ø | 350-850Ø | Locale, régionale |
| **Production cinéma** | 40.000Ø | Variable (hit = jackpot 5.000Ø/h+) | Films, séries |
| **Plateforme streaming** | 35.000Ø | 1.000-4.000Ø | SVOD, contenu |
| **Esport** | 15.000Ø | 500-2.000Ø | Tournois, sponsoring |

---

### 12. SANTÉ & BIEN-ÊTRE

| Type | Coût | Revenu Ø/h | Description |
|------|------|------------|-------------|
| **Clinique privée** | 40.000Ø | 1.300-3.200Ø | Médical, chirurgie |
| **Réseau pharmacies** | 25.000Ø | 800-2.000Ø | Parapharmacie |
| **Salles de sport** | 8.000Ø | 250-650Ø | Fitness, coaching |
| **Spa/Thalasso** | 12.000Ø | 400-1.000Ø | Bien-être |
| **EHPAD** | 30.000Ø | 650-1.600Ø | Maisons retraite |

---

### 13. ÉDUCATION & FORMATION

| Type | Coût | Revenu Ø/h | Description |
|------|------|------------|-------------|
| **École privée** | 20.000Ø | 500-1.200Ø | Primaire/collège |
| **Université** | 100.000Ø | 2.500-6.000Ø | Supérieur, recherche |
| **Formation pro** | 5.000Ø | 170-500Ø | Certifications |
| **Bootcamp tech** | 8.000Ø | 350-850Ø | Développement, data |
| **Plateforme e-learning** | 6.000Ø | 250-650Ø | Cours en ligne |

---

### 14. AGRICULTURE & AGROALIMENTAIRE

| Type | Coût | Revenu Ø/h | Description |
|------|------|------------|-------------|
| **Céréalier** | 15.000Ø | 350-850Ø | Blé, maïs, soja |
| **Élevage** | 20.000Ø | 400-1.000Ø | Bovin, porcin, volaille |
| **Viticulture** | 25.000Ø | 500-1.300Ø | Vignoble, vin |
| **Maraîchage bio** | 8.000Ø | 200-500Ø | Légumes, fruits |
| **Aquaculture** | 12.000Ø | 300-750Ø | Pisciculture, crustacés |

---

### 15. ARMEMENT & DÉFENSE

| Type | Coût | Revenu Ø/h | Description |
|------|------|------------|-------------|
| **Aéronautique militaire** | 500.000Ø | 24.000-64.000Ø | Avions de combat |
| **Électronique défense** | 100.000Ø | 5.000-13.000Ø | Systèmes, radars |
| **Sécurité privée** | 5.000Ø | 250-650Ø | Gardiennage |
| **Cyber-défense étatique** | 50.000Ø | 1.600-4.000Ø | Contrats gouvernement |

---

## 🏗️ SYSTÈME DE DÉVELOPPEMENT TERRITORIAL

### Gentrification Avancée

```typescript
interface GentrificationSystem {
  // Quand un projet majeur s'installe
  projetDeclencheur: {
    type: 'casino' | 'hotel' | 'usine' | 'centre_commercial' | 'aeroport';
    investissement: number;
    emplois_crees: number;
  };
  
  // Impact immobilier
  zones_impactees: {
    zone_1: { distance: "0-500m", impact: 3.0 }; // ×3 prix
    zone_2: { distance: "500m-2km", impact: 2.0 }; // ×2 prix
    zone_3: { distance: "2km-5km", impact: 1.5 }; // ×1.5 prix
    zone_4: { distance: "5km+", impact: 1.2 }; // ×1.2 prix
  };
  
  // Timeline
  phases: [
    { mois: 0, evenement: "Annonce projet", impact: 1.1 },
    { mois: 3, evenement: "Début travaux", impact: 1.3 },
    { mois: 12, evenement: "Ouverture", impact: 1.8 },
    { mois: 24, evenement: "Maturité", impact: 2.5 },
    { mois: 36, evenement: "Équilibre", impact: 3.0 }
  ];
  
  // Opportunités pour le joueur
  strategies: {
    speculatif: "Acheter AVANT annonce (infos privilégiées)";
    reactif: "Acheter au début travaux";
    developpeur: "Construire pour la nouvelle demande";
    hold: "Posséder et louer aux nouveaux résidents";
  };
}
```

**Exemples de stratégies territoriales** :

| Situation | Action | Investissement | ROI 3 ans |
|-----------|--------|----------------|-----------|
| **Casino annoncé** | Acheter 10 appartements proches | 500.000Ø | +200% |
| **Usine dans village** | Acheter terrains + construire maisons | 200.000Ø | +300% |
| **Aéroport international** | Hôtels + parkings + restaurants | 1.000.000Ø | +150% |
| **Centre commercial** | Commerces adjacents, parking | 300.000Ø | +180% |

### Développement de Quartiers

Le joueur peut devenir **promoteur urbain** :
1. Acheter parcelles en friche
2. Démolir/construire
3. Créer un écosystème (habitat + commerce + services)
4. Revendre en lots ou gérer en location

**Exemple : Réhabilitation quartier industriel** :
- Achat ancienne usine : 500.000Ø
- Démolition + dépollution : 200.000Ø
- Construction loft/coworkings : 1.500.000Ø
- Commerces de proximité : 300.000Ø
- **Total investi** : 2.500.000Ø
- **Valeur après 5 ans** : 7.000.000Ø
- **Plus-value** : +180%

---

## 🏪 SYSTÈME DE FRANCHISES

### Développer en Franchise

Une fois une entreprise **mature** (3+ ans, rentable) :

```typescript
interface FranchiseSystem {
  entreprise_mere: {
    nom: string;
    marque: string; // Notoriété 0-100
    concept: string; // DA validée
  };
  
  franchise: {
    droit_entree: number; // 10.000-100.000Ø
    redevance: number; // % du CA mensuel (3-8%)
    revenu_franchiseur: number; // Ø/h passif par franchise
    support: ['formation', 'marketing', 'supply_chain'];
  };
  
  expansion: {
    max_franchises: number; // Illimité théorique
    controle_qualite: boolean; // Obligatoire
  };
}
```

**Exemple - Chaîne de restaurants** :
| Étape | Restaurants | Revenu/h total | Description |
|-------|-------------|----------------|-------------|
| **Unité 1** | 1 | 200Ø | Original, propre |
| **Franchise 1** | 2 | 200Ø + 30Ø | + 1 franchisé |
| **Franchise 5** | 6 | 200Ø + 150Ø | + 5 franchisés |
| **Franchise 20** | 21 | 200Ø + 600Ø | Réseau régional |
| **Franchise 100** | 101 | 200Ø + 3.000Ø | Empire national |

**Avantages franchises** :
- Revenus passifs Ø/h sans gestion directe
- Expansion rapide sans capital
- Notoriété croissante

**Risques** :
- Franchiseur de mauvaise qualité (impact marque)
- Conflits juridiques
- Concurrence entre franchisés

---

## 📈 INTRODUCTION EN BOURSE (IPO)

### Coter son Entreprise

**Conditions** :
- Entreprise mature (5+ ans)
- Rentable depuis 3 ans
- CA minimum : 1.000.000Ø/an
- Audit financier positif

**Processus IPO** :
```typescript
interface IPOProcess {
  preparation: {
    duree: "6-12 mois";
    couts: 500.000Ø; // Audits, conseils, roadshow
    valorisation: number; // Multiple du résultat net
  };
  
  introduction: {
    pourcentage_vendu: number; // 20-30% typiquement
    prix_action: number;
    nombre_actions: number;
    capital_leve: number; // Argent frais pour l'entreprise
  };
  
  post_IPO: {
    valeur_actions_joueur: number; // Restant (70-80%)
    liquidite: boolean; // Peut vendre progressivement
    cours_bourse: number; // Fluctue selon résultats
  };
}
```

**Exemple IPO** :
- Entreprise : Chaîne de gyms "FitPro"
- Résultat net : 500.000Ø/an
- Valorisation : ×15 = 7.500.000Ø
- IPO 25% : 1.875.000Ø levés
- Joueur garde 75% : Valeur 5.625.000Ø

**Avantages IPO** :
- Capital frais pour expansion
- Visibilité, prestige
- Exit possible (vendre ses actions)
- Monnaie d'échange (acquisitions par actions)

**Contraintes** :
- Transparence financière (trimestrielle)
- Pression court terme (résultats trimestriels)
- Actionnaires activistes
- Coûts de conformité élevés

### Trading d'Actions Propres

Une fois cotée, le joueur peut :
- **Vendre** ses actions progressivement (liquider)
- **Racheter** des actions (soutien cours)
- **Émettre** de nouvelles actions (dilution pour levée)
- **Fusionner** avec autre entreprise cotée

**Stratégie de sortie** :
1. IPO à ×15 bénéfices
2. Vente progressive 25% par an
3. Diversification dans autres actifs
4. Exit total après 4 ans = fortune assurée

---

## 🏆 ACHIEVEMENTS & TROPHÉES (100+)

### 🎯 Progression de Fortune

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 1 | **Premier Pas** | Gagner 100Ø via mini-jeux | 50Ø bonus |
| 2 | **Centenaire** | Atteindre 100Ø de fortune | Badge bronze |
| 3 | **Millénium** | Atteindre 1.000Ø | 100Ø bonus |
| 4 | **Décamillénium** | Atteindre 10.000Ø | Badge argent |
| 5 | **Centenaire²** | Atteindre 100.000Ø | 1.000Ø bonus |
| 6 | **Millionnaire** | Atteindre 1.000.000Ø | Badge or |
| 7 | **Dix-Millionnaire** | Atteindre 10.000.000Ø | 10.000Ø bonus |
| 8 | **Cent-Millionnaire** | Atteindre 100.000.000Ø | Badge platine |
| 9 | **Milliardaire** | Atteindre 1.000.000.000Ø | 100.000Ø bonus |
| 10 | **Multi-Milliardaire** | Atteindre 10.000.000.000Ø | Badge diamant |
| 11 | **Cent-Milliardaire** | Atteindre 100.000.000.000Ø | Titre "Légende" |
| 12 | **Trillionnaire** | Atteindre 1.000.000.000.000Ø | Skin exclusif |

---

### 📈 Classement Forbes

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 13 | **Top 10.000** | Entrer dans le classement Forbes | Badge "Débutant" |
| 14 | **Top 5.000** | Atteindre le rang 5.000 | 500Ø bonus |
| 15 | **Top 2.000** | Atteindre le rang 2.000 | Badge "En progression" |
| 16 | **Top 1.000** | Atteindre le rang 1.000 | 1.000Ø bonus |
| 17 | **Top 500** | Atteindre le rang 500 | Badge "Prometteur" |
| 18 | **Top 200** | Atteindre le rang 200 | 5.000Ø bonus |
| 19 | **Top 100** | Atteindre le rang 100 | Badge "Élite" |
| 20 | **Top 50** | Atteindre le rang 50 | 10.000Ø bonus |
| 21 | **Top 25** | Atteindre le rang 25 | Badge "Top 25" |
| 22 | **Top 10** | Atteindre le rang 10 | 50.000Ø bonus |
| 23 | **Top 5** | Atteindre le rang 5 | Badge "Top 5" |
| 24 | **Top 3** | Atteindre le rang 3 | 100.000Ø bonus |
| 25 | **Top 2** | Atteindre le rang 2 | Badge "Vice-champion" |
| 26 | **TOP 1 FORBES** | Devenir la personne la plus riche | Titre "Magnat Suprême" + 1.000.000Ø |
| 27 | **Conquérant** | Rester Top 1 pendant 1 an de jeu | Badge "Incontestable" |
| 28 | **Dictateur Économique** | Rester Top 1 pendant 5 ans de jeu | Skin légendaire |

---

### 🏢 Création d'Entreprises

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 29 | **Entrepreneur** | Créer sa première entreprise | 100Ø bonus |
| 30 | **Serial Entrepreneur** | Créer 5 entreprises | Badge "Multi-actif" |
| 31 | **Empire Builder** | Créer 10 entreprises | 500Ø bonus |
| 32 | **Conglomérat** | Créer 25 entreprises | Badge "Magnat" |
| 33 | **Tout un Chacun** | Créer 50 entreprises | 2.000Ø bonus |
| 34 | **Capitalisme Pur** | Créer 100 entreprises | Titre "Capitaliste" |
| 35 | **Diversifié** | Posséder 1 entreprise de chaque secteur | 1.000Ø bonus |
| 36 | **Touche-à-Tout** | Posséder 5 secteurs différents | Badge "Diversifié" |
| 37 | **Spécialiste Retail** | Posséder 5 entreprises retail | 500Ø bonus |
| 38 | **Spécialiste Tech** | Posséder 5 entreprises tech | Badge "Tech Guru" |
| 39 | **Spécialiste Industrie** | Posséder 5 entreprises industrielles | 500Ø bonus |
| 40 | **Spécialiste Services** | Posséder 5 entreprises services | Badge "Service King" |

---

### 💼 Types d'Entreprises Spécifiques

#### Retail & Services
| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 41 | **Fashion Victim** | Créer une entreprise de vêtements | Skin fashion |
| 42 | **King of Fast Fashion** | Avoir 10 boutiques fast fashion | Badge "Mode" |
| 43 | **Luxe Éternel** | Créer une marque de luxe | 1.000Ø bonus |
| 44 | **Boisson Énergisante** | Créer une entreprise de boissons | Skin énergie |
| 45 | **Coca du Pauvre** | Vendre 1M de boissons | 500Ø bonus |
| 46 | **Foodie** | Créer un restaurant | Badge "Chef" |
| 47 | **McRich** | Avoir 20 fast-foods | 2.000Ø bonus |
| 48 | **Électronique Addict** | Créer une boutique électronique | Skin tech |
| 49 | **Apple Rival** | Vendre 100k smartphones | 5.000Ø bonus |
| 50 | **Beauty Queen** | Créer une entreprise cosmétiques | Badge "Beauté" |
| 51 | **Ikea Style** | Créer une entreprise de meubles | Skin déco |

#### Tech & Digital
| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 52 | **Coder** | Créer un SaaS | Badge "Dev" |
| 53 | **Unicorn Hunter** | Avoir un SaaS valorisé 1MØ | 10.000Ø bonus |
| 54 | **Hardware Hero** | Créer une entreprise hardware | Skin hardware |
| 55 | **Tesla Who?** | Vendre 10k composants électroniques | 2.000Ø bonus |
| 56 | **Game Dev** | Créer un studio de jeux | Badge "Gamer" |
| 57 | **Hit Maker** | Avoir un jeu viral (+10.000Ø/h) | 20.000Ø bonus |
| 58 | **Cyber Protector** | Créer entreprise cybersécurité | Skin hacker |
| 59 | **White Hat** | Protéger 100 entreprises clients | 3.000Ø bonus |

#### Transport & Logistique
| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 60 | **Wright Brother** | Créer une compagnie aérienne | Badge "Aviation" |
| 61 | **Airbus Rival** | Avoir 50 avions | 10.000Ø bonus |
| 62 | **Flying Rich** | Générer 100MØ avec compagnie aérienne | 15.000Ø bonus |
| 63 | **Truck Driver** | Créer entreprise logistique | Skin camion |
| 64 | **FedEx Killer** | Avoir 100 camions | 5.000Ø bonus |
| 65 | **Last Mile King** | Livrer 1M colis | 3.000Ø bonus |

#### Immobilier
| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 66 | **Brick Lord** | Créer agence immobilière | Badge "Brique" |
| 67 | **Promoteur** | Construire 10 immeubles | 5.000Ø bonus |
| 68 | **Gentrificateur** | Développer 5 quartiers | 10.000Ø bonus |
| 69 | **Slum Lord** | Posséder 100 logements sociaux | Badge "Propriétaire" |
| 70 | **Luxury Developer** | Construire 5 immeubles de luxe | 8.000Ø bonus |
| 71 | **Skyscraper** | Construire un gratte-ciel | 25.000Ø bonus |

#### Spéciaux
| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 72 | **Casino Royal** | Créer un casino | Badge "007" |
| 73 | **House Always Wins** | Générer 50MØ avec casino | 10.000Ø bonus |
| 74 | **Hotel Magnate** | Créer hôtel 5★ | Skin hôtelier |
| 75 | **Hilton Style** | Avoir 20 hôtels | 15.000Ø bonus |
| 76 | **Industrial Titan** | Créer usine automobile | Badge "Usine" |
| 77 | **Ford Legacy** | Produire 100k voitures | 20.000Ø bonus |
| 78 | **Big Pharma** | Créer entreprise pharma | Skin médecin |
| 79 | **Vaccine Maker** | Vendre 1M médicaments | 12.000Ø bonus |
| 80 | **Green Energy** | Créer parc solaire/éolien | Badge "Écolo" |
| 81 | **Elon Style** | Générer 500MØ énergie verte | 30.000Ø bonus |
| 82 | **Oil Baron** | Créer entreprise pétrole | Skin pétrolier |
| 83 | **Rockefeller** | Extraire 10M barils | 50.000Ø bonus |
| 84 | **Nuclear Boss** | Créer centrale nucléaire | Badge "Atomique" |
| 85 | **Oppenheimer** | Générer 1BØ nucléaire | 100.000Ø bonus |
| 86 | **Media Mogul** | Créer chaîne TV | Badge "Média" |
| 87 | **Netflix Style** | Avoir 1M abonnés streaming | 40.000Ø bonus |
| 88 | **Hollywood Star** | Produire film à 100MØ recettes | 25.000Ø bonus |
| 89 | **Health Baron** | Créer clinique privée | Badge "Santé" |
| 90 | **Dr House** | Soigner 100k patients | 8.000Ø bonus |
| 91 | **Education Tycoon** | Créer université | Skin professeur |
| 92 | **Harvard Style** | Diplômer 50k étudiants | 15.000Ø bonus |
| 93 | **Farm Life** | Créer exploitation agricole | Badge "Fermier" |
| 94 | **Monsanto Style** | Produire 10M tonnes céréales | 10.000Ø bonus |
| 95 | **Wine Lord** | Avoir vignoble de 100 hectares | 7.000Ø bonus |
| 96 | **War Profiteer** | Créer entreprise armement | Badge "Militaire" |
| 97 | **Merchant of Death** | Vendre armes pour 1BØ | 75.000Ø bonus |
| 98 | **Iron Man** | Créer aéronautique militaire | Skin Tony Stark |

---

### 🏪 Franchises

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 99 | **Franchisor** | Créer première franchise | 500Ø bonus |
| 100 | **Franchise King** | Avoir 10 franchisés | 2.000Ø bonus |
| 101 | **McDonald Style** | Avoir 100 franchisés | 10.000Ø bonus |
| 102 | **Global Brand** | Avoir 500 franchisés | 50.000Ø bonus |
| 103 | **Franchise Empire** | Avoir 1000 franchisés | 100.000Ø bonus |
| 104 | **World Dominator** | Franchises dans 50 pays | Titre "Global" |

---

### 📈 Bourse & IPO

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 105 | **IPO Baby** | Coter première entreprise | 2.000Ø bonus |
| 106 | **Wall Street** | Avoir 3 entreprises cotées | 5.000Ø bonus |
| 107 | **Stock Master** | Valorisation bourse totale 1BØ | 20.000Ø bonus |
| 108 | **Bull Market** | Cours actions ×2 en 1 an | 10.000Ø bonus |
| 109 | **Bear Hunter** | Racheter actions après krach | 8.000Ø bonus |
| 110 | **Dividend King** | Percevoir 10MØ dividendes | 5.000Ø bonus |
| 111 | **Market Maker** | Influencer cours d'une action | Badge "Trader" |
| 112 | **Oracle of Omaha** | Rendement bourse 50%/an sur 5 ans | 50.000Ø bonus |

---

### 💱 Trading & Crypto

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 113 | **Day Trader** | Faire 100 trades | 500Ø bonus |
| 114 | **Swing Master** | Gain 100kØ sur un swing | 1.000Ø bonus |
| 115 | **WallStreetBets** | Gain 1MØ sur trade risqué | 5.000Ø bonus |
| 116 | **HODLer** | Garder crypto 1 an | Badge "Patient" |
| 117 | **Bitcoin Millionaire** | Fortune 1MØ en crypto | 10.000Ø bonus |
| 118 | **Crypto King** | Miner 10 coins | 3.000Ø bonus |
| 119 | **Staking Pro** | Gagner 100kØ en staking | 2.000Ø bonus |
| 120 | **Altcoin Hunter** | Posséder 10 cryptos différentes | Badge "Diversifié" |
| 121 | **Pump & Dump Survivor** | Survivre crash crypto 80% | 5.000Ø bonus |
| 122 | **Whale** | Posséder 1MØ en une seule crypto | 15.000Ø bonus |

---

### 💰 Optimisation Fiscale

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 123 | **Fiscaliste** | Optimiser fiscalement 1 entreprise | 1.000Ø bonus |
| 124 | **Tax Avoider** | Payer 0% impôts 1 an | 5.000Ø bonus |
| 125 | **Offshore Pro** | Créer structure offshore | 3.000Ø bonus |
| 126 | **Transfer Pricer** | Utiliser transfert pricing | 4.000Ø bonus |
| 127 | **Tax Free** | Générer 100MØ sans impôts | 20.000Ø bonus |
| 128 | **Paradise Papers** | Avoir 5 sociétés offshores | 10.000Ø bonus |
| 129 | **Audit Survivor** | Survivre contrôle fiscal | 8.000Ø bonus |
| 130 | **Legal Tax Evader** | Économiser 50MØ en impôts | 15.000Ø bonus |

---

### 🏗️ Développement Territorial

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 131 | **Gentrificateur** | Créer gentrification ×2 prix | 3.000Ø bonus |
| 132 | **Urban Developer** | Transformer 3 quartiers | 10.000Ø bonus |
| 133 | **Village Savior** | Relancer village avec usine | 5.000Ø bonus |
| 134 | **City Builder** | Créer ville de 10k habitants | 15.000Ø bonus |
| 135 | **Master Plan** | Développement avec casino + hôtel + logements | 25.000Ø bonus |
| 136 | **Land Baron** | Posséder 10km² terrains | 20.000Ø bonus |
| 137 | **Speculator** | Plus-value 100MØ immo | 10.000Ø bonus |
| 138 | **Community Builder** | Loger 1000 ouvriers | 8.000Ø bonus |

---

### ⚡ Performance & Records

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 139 | **Speedrunner** | 1MØ en moins de 1h | 5.000Ø bonus |
| 140 | **Blitzkrieg** | 1BØ en moins de 20h | 50.000Ø bonus |
| 141 | **Marathon Man** | Jouer 100h | Badge "Marathon" |
| 142 | **Completionist** | Tous achievements | Titre "Maître" |
| 143 | **Rich in 5** | Fortune ×10 en 5 minutes | 2.000Ø bonus |
| 144 | **No Mini-Games** | 1MØ sans mini-jeux | 10.000Ø bonus |
| 145 | **First Try** | Top 1 sans faillite | 25.000Ø bonus |
| 146 | **Phoenix** | Revenir de 0 après faillite | 15.000Ø bonus |
| 147 | **Unstoppable** | Jamais de mois négatif | 30.000Ø bonus |
| 148 | **Perfect Year** | Croissance +50% 12 mois consécutifs | 20.000Ø bonus |

---

### 🎭 Achievements Secrets (Easter Eggs)

| # | Achievement | Condition | Récompense |
|---|-------------|-----------|------------|
| 149 | **?** | Créer entreprise nommée "Tesla" | 1.000Ø bonus |
| 150 | **?** | Créer entreprise nommée "Apple" | 1.000Ø bonus |
| 151 | **?** | Créer entreprise nommée "Microsoft" | 1.000Ø bonus |
| 152 | **?** | Avoir fortune exactement égale à 42.000.000Ø | 4.200Ø bonus |
| 153 | **?** | Perdre 100MØ en 1 jour (krach) | 10.000Ø bonus |
| 154 | **?** | Créer entreprise dans chaque continent | 25.000Ø bonus |
| 155 | **?** | Avoir 666 entreprises | Badge "Démoniaque" |
| 156 | **?** | Gagner jackpot casino 3 fois de suite | 50.000Ø bonus |
| 157 | **?** | Survivre 10 crises économiques | 30.000Ø bonus |
| 158 | **?** | Dépasser Elon R. Mask en 10h | 100.000Ø bonus |
| 159 | **?** | Tous les achievements secrets | Skin "Mystère" |
| 160 | **THE END** | Atteindre 999.999.999.999Ø | Fin alternative |

---

**Document complet mis à jour avec mécaniques avancées.**

*Priorité : Phase 1 (Mini-jeux plafonnés + 2 premières entreprises)*

- Innovation design
- Marketing storytelling
- Revenu/h : Modeste mais valeur entreprise élevée

**"Discount Local Équitable"** :
- Prix cassés, volume extrême
- Circuit court
- Salaires décents
- Revenu/h : Élevé par volume

---

## �👥 GESTION DES RESSOURCES HUMAINES

### Types d'Employés Détaillés

| Niveau | Salaire/mois | Prod. | Recrutement | Satisfaction | Turnover |
|--------|-------------|-------|-------------|--------------|----------|
| **Stagiaire** | 800Ø | 40% | 1 jour | 50% | 20%/mois |
| **Junior** | 1.500Ø | 70% | 1 semaine | 60% | 10%/mois |
| **Confirmé** | 2.500Ø | 100% | 2 semaines | 70% | 5%/mois |
| **Senior** | 4.000Ø | 150% | 1 mois | 75% | 3%/mois |
| **Expert** | 7.000Ø | 200% | 3 mois | 80% | 1%/mois |

**Spécialisations** :
- Commercial : Bonus sur objectifs
- Production : Prime productivité
- R&D : Prime innovation (brevets)
- Management : Bonus équipe

### Satisfaction et Turnover

```typescript
interface Satisfaction {
  global: number; // 0-100
  
  composantes: {
    remuneration: number; // Salaire vs marché
    conditions: number; // Locaux, équipement
    charge: number; // Heures, stress
    evolution: number; // Formation, promo
    ambiance: number; // Collègues, manager
  };
  
  // Conséquences
  productiviteImpact: number; // % modif
  risqueDemission: number; // % mensuel
  risqueBurnout: number; // % si surcharge
}
```

**Impact sur revenu/h de l'entreprise** :
- Satisfaction > 80% : +10% productivité (revenu/h ×1.1)
- Satisfaction 60-80% : Normal
- Satisfaction 40-60% : -15% productivité
- Satisfaction < 40% : -30% productivité + risque départ

### Recrutement

**Canaux** :
- **Annonce classique** : 500Ø, pool aléatoire
- **Chasseur de têtes** : 3.000Ø, accès seniors/experts
- **Réseau** : Gratuit, limité connaissances
- **Candidature spontanée** : Gratuit, qualité variable

**Processus** :
1. Tri CV (automatique vs manuel)
2. Entretien (décision rapide)
3. Période d'essai (1-3 mois)
4. Embauche définitive ou licenciement

---

## 💰 COMPTABILITÉ RÉALISTE DÉTAILLÉE
n
