-- Création de l'utilisateur admin Ønyx
-- UUID: 06e13972-5ad7-4d88-8fae-0cd9b5df36da
-- À exécuter dans Supabase SQL Editor

-- 1. Créer Nova (ville de départ) si elle n'existe pas
INSERT INTO map_locations (id, name, lat, lng, unlocked, "requiredUsersToUnlock")
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Nova',
    48.8566,
    2.3522,
    true,
    0
) ON CONFLICT (name) DO NOTHING;

-- 2. Créer l'utilisateur admin
INSERT INTO users (
    id,
    email,
    username,
    "displayName",
    "firstName",
    "lastName",
    "createdAt"
) VALUES (
    '06e13972-5ad7-4d88-8fae-0cd9b5df36da',
    'onyx@orbis.local',
    'Ønyx',
    'Ønyx Admin',
    'Ønyx',
    'Admin',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Créer le GameProfile avec résidence à Nova
INSERT INTO game_profiles (
    id,
    "userId",
    "homeLocationId",
    "totalBalance"
) VALUES (
    gen_random_uuid(),
    '06e13972-5ad7-4d88-8fae-0cd9b5df36da',
    (SELECT id FROM map_locations WHERE name = 'Nova' LIMIT 1),
    100000
) ON CONFLICT DO NOTHING;

-- 4. Créer le compte bancaire personnel
INSERT INTO bank_accounts (
    id,
    "ownerId",
    "ownerType",
    balance,
    "accountNumber",
    "createdAt"
) VALUES (
    gen_random_uuid(),
    '06e13972-5ad7-4d88-8fae-0cd9b5df36da',
    'PERSONAL',
    100000,
    'ORB-ADMIN-0001',
    NOW()
) ON CONFLICT ("accountNumber") DO NOTHING;

-- 5. Créer le compte "Banque Internationale"
INSERT INTO bank_accounts (
    id,
    "ownerId",
    "ownerType",
    balance,
    "accountNumber",
    "createdAt"
) VALUES (
    gen_random_uuid(),
    '06e13972-5ad7-4d88-8fae-0cd9b5df36da',
    'PERSONAL',
    0,
    'ORB-INTL-0001',
    NOW()
) ON CONFLICT ("accountNumber") DO NOTHING;

SELECT 'Admin Ønyx créé avec succès !' as message;
