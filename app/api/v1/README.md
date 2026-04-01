# Ørbis API v1.0

API publique en lecture seule pour accéder aux données du monde Ørbis.

## Base URL

```
https://orbis.app/api/v1
```

## Headers de réponse

Toutes les réponses incluent :

```
Cache-Control: public, max-age=60
X-Orbis-Version: 1.0
```

## Rate Limiting

100 requêtes par minute par IP.

---

## Endpoints

### `GET /stats`

Statistiques globales du monde.

**Réponse :**

```json
{
  "totalUsers": 150,
  "totalCompanies": 45,
  "totalTransactions": 1200,
  "totalOrbesCirculating": "5000000",
  "activeEvents": [],
  "timestamp": "2026-04-01T10:00:00Z"
}
```

---

### `GET /companies`

Liste paginée des entreprises.

**Paramètres :**

| Paramètre | Type    | Défaut | Description           |
|-----------|---------|---------|-----------------------|
| page      | integer | 1       | Numéro de page        |
| limit     | integer | 20      | Éléments par page (max 100) |

**Réponse :**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ørbis Corp",
      "objective": "Production d'énergie",
      "location": { "name": "Nova" },
      "owner": { "username": "john" },
      "createdAt": "2026-01-15T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### `GET /companies/[id]`

Détail d'une entreprise (données publiques uniquement).

**Réponse :**

```json
{
  "id": "uuid",
  "name": "Ørbis Corp",
  "objective": "Production d'énergie",
  "description": "...",
  "createdAt": "2026-01-15T08:30:00Z",
  "location": { "name": "Nova" },
  "owner": { "username": "john" },
  "shareInfo": {
    "isListed": true,
    "currentPrice": "1000"
  }
}
```

---

### `GET /market/prices`

Prix de référence de toutes les ressources.

**Réponse :**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Électricité",
      "category": "ENERGY",
      "basePrice": "100",
      "unit": "kWh"
    }
  ],
  "timestamp": "2026-04-01T10:00:00Z"
}
```

---

### `GET /market/stocks`

Actions cotées en bourse avec prix actuel.

**Réponse :**

```json
{
  "data": [
    {
      "id": "uuid",
      "totalShares": 1000,
      "availableShares": 300,
      "currentPrice": "1500",
      "isListed": true,
      "company": {
        "id": "uuid",
        "name": "Ørbis Corp",
        "objective": "..."
      }
    }
  ],
  "timestamp": "2026-04-01T10:00:00Z"
}
```

---

### `GET /map/locations`

Toutes les localisations avec leur statut.

**Réponse :**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Nova",
      "lat": 48.8566,
      "lng": 2.3522,
      "unlocked": true,
      "requiredUsersToUnlock": 0,
      "_count": {
        "residents": 50,
        "companies": 12
      }
    }
  ],
  "timestamp": "2026-04-01T10:00:00Z"
}
```

---

### `GET /events/active`

Événements dynamiques actifs en ce moment.

**Réponse :**

```json
{
  "data": [],
  "timestamp": "2026-04-01T10:00:00Z"
}
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide |
| 404  | Ressource introuvable |
| 429  | Rate limit exceeded |
| 500  | Erreur serveur |

## Exemple d'utilisation

```bash
curl https://orbis.app/api/v1/stats
curl https://orbis.app/api/v1/companies?page=1&limit=10
curl https://orbis.app/api/v1/market/prices
```

---

**Note :** Cette API ne retourne jamais d'informations privées (emails, soldes de compte, etc.)
