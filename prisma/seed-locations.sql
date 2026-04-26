-- Seed locations for Phase 1
-- Run this SQL in your Supabase SQL Editor

INSERT INTO game_locations (id, name, address, lat, lng, type, district, rent_per_sqm, foot_traffic, visibility, accessibility, has_parking, has_fiber, has_loading_dock, has_storage, gentrification_level, major_projects_nearby, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Rue de Rivoli - Boutique 1', '125 Rue de Rivoli, Paris', 48.8566, 2.3522, 'COMMERCIAL', 'Paris 1er', 150, 95, 90, 95, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Avenue des Champs-Élysées', 'Avenue des Champs-Élysées, Paris', 48.8698, 2.3078, 'COMMERCIAL', 'Paris 8ème', 200, 90, 95, 90, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'La Défense - Tour Espace', '15 Place de la Défense, Puteaux', 48.8925, 2.2369, 'FINANCIAL', 'La Défense', 120, 80, 85, 90, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Bastille - Local Commercial', '12 Boulevard Beaumarchais, Paris', 48.8530, 2.3691, 'COMMERCIAL', 'Paris 11ème', 100, 75, 70, 85, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Porte de Versailles - Entrepôt', '1 Place de la Porte de Versailles, Paris', 48.8323, 2.2876, 'INDUSTRIAL', 'Paris 15ème', 40, 30, 40, 70, false, false, true, true, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Roissy-Charles de Gaulle - Terminal', '95700 Roissy-en-France', 49.0097, 2.5479, 'AIRPORT', 'Roissy', 180, 85, 80, 95, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Presqu''île - Local Premium', 'Place Bellecour, Lyon', 45.7578, 4.8320, 'COMMERCIAL', 'Lyon Centre', 110, 85, 85, 90, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Vaise - Zone Industrielle', 'Quartier de Vaise, Lyon', 45.7700, 4.8000, 'INDUSTRIAL', 'Lyon 9ème', 35, 25, 35, 60, false, false, true, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Vieux-Port - Commerce', 'Quai des Belges, Marseille', 43.2965, 5.3698, 'TOURIST', 'Marseille Centre', 95, 80, 85, 75, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Grand Littoral - Zone Portuaire', 'Port de Marseille', 43.3500, 5.3500, 'PORT', 'Marseille Port', 55, 40, 50, 70, false, false, true, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Place de la Bourse', 'Place de la Bourse, Bordeaux', 44.8420, -0.5700, 'COMMERCIAL', 'Bordeaux Centre', 105, 80, 85, 85, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Grand Place - Commerce', 'Grand Place, Lille', 50.6292, 3.0573, 'COMMERCIAL', 'Lille Centre', 85, 75, 80, 80, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Passage Pommeraye - Boutique', 'Passage Pommeraye, Nantes', 47.2133, -1.5592, 'COMMERCIAL', 'Nantes Centre', 80, 70, 75, 75, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Saint-Just-en-Chaussée - Terrain', 'Rue Principale, Saint-Just', 49.5060, 2.4310, 'RURAL', 'Saint-Just-en-Chaussée', 5, 10, 15, 30, false, false, false, false, 0, 0, true, now(), now()),
(gen_random_uuid(), 'Villeneuve-sur-Lot - Local', 'Centre bourg, Villeneuve', 44.4000, 0.7167, 'RURAL', 'Villeneuve-sur-Lot', 6, 12, 18, 35, false, false, false, false, 0, 0, true, now(), now())
ON CONFLICT DO NOTHING;
