-- Ciudad Justa · seed de desarrollo (capa caliente).
-- Puntos curados con descripciones GENÉRICAS (no señalan propiedades concretas;
-- coherente con docs/06 §6.3). Solo para entorno de demo/desarrollo.
-- Aplicar:  wrangler d1 execute ciudad-justa --file=db/seed.sql
-- (Requiere db/schema.sql aplicado antes.)

INSERT OR IGNORE INTO users (id, handle, role, reputation, created_at)
VALUES ('seed', 'Equipo Ciudad Justa', 'moderator', 5.0, 1733000000000);

INSERT OR IGNORE INTO reports (id, lat, lng, geohash, status, taxonomy_version, score, description, created_by, created_at, updated_at) VALUES
 ('seed_01', 41.3851, 2.1734, 'sp3e3qd', 'confirmed',  1, 4.2, 'Banco con apoyabrazos divisorios', 'seed', 1733000000000, 1733000000000),
 ('seed_02', 41.3870, 2.1700, 'sp3e3q9', 'reported',   1, 0.0, 'Pinchos en repisa de portal',       'seed', 1733600000000, 1733600000000),
 ('seed_03', 41.3820, 2.1650, 'sp3e3mu', 'disputed',   1, 0.5, 'Barra inclinada en parada',          'seed', 1734000000000, 1734000000000),
 ('seed_04', 41.3895, 2.1810, 'sp3e3wd', 'confirmed',  1, 3.1, 'Banco y fuente retirados de la plaza','seed', 1734200000000, 1734200000000),
 ('seed_05', 41.3788, 2.1772, 'sp3e3qb', 'confirmed',  1, 2.7, 'Iluminacion azul disuasoria',         'seed', 1734400000000, 1734400000000),
 ('seed_06', 41.3835, 2.1888, 'sp3e6h8', 'confirmed',  1, 3.8, 'Rocas y pinchos bajo paso elevado',   'seed', 1734600000000, 1734600000000),
 ('seed_07', 41.3955, 2.1690, 'sp3e3yq', 'documented', 1, 5.0, 'Bancos retirados tras presion vecinal','seed', 1734800000000, 1734800000000),
 ('seed_08', 41.3792, 2.1845, 'sp3e6h2', 'reported',   1, 0.0, 'Suelo de grava gruesa bajo cornisa',  'seed', 1735000000000, 1735000000000);

INSERT OR IGNORE INTO report_categories (report_id, category_key) VALUES
 ('seed_01', 'anti_lie_down'), ('seed_01', 'barrier'),
 ('seed_02', 'spikes'),
 ('seed_03', 'anti_sit'),
 ('seed_04', 'ghost_amenity'),
 ('seed_05', 'light_sound'),
 ('seed_06', 'spikes'), ('seed_06', 'barrier'),
 ('seed_07', 'anti_lie_down'),
 ('seed_08', 'surface');
