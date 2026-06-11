-- Ciudad Justa · esquema de la capa caliente (reportes ciudadanos)
-- Destino: Cloudflare D1 (SQLite). Portable a Postgres/PostGIS al escalar
-- (ver docs/04-modelo-de-datos.md §4.5). Aplicar con: wrangler d1 execute <db> --file=db/schema.sql
--
-- Convenciones: ids TEXT (uuid/ksuid generado en el Worker), timestamps en epoch ms (INTEGER).

PRAGMA foreign_keys = ON;

-- Usuarios: anónimos por dispositivo; email opcional al "reclamar" la cuenta.
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  handle      TEXT,
  email       TEXT UNIQUE,                 -- NULL hasta que se reclama la cuenta
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','moderator','admin')),
  reputation  REAL NOT NULL DEFAULT 1.0,   -- peso base; sube/baja con el consenso
  created_at  INTEGER NOT NULL
);

-- Reportes: un punto de exclusión (hostil/clima/vivienda/servicios).
CREATE TABLE IF NOT EXISTS reports (
  id               TEXT PRIMARY KEY,
  lat              REAL NOT NULL,
  lng              REAL NOT NULL,
  type             TEXT NOT NULL DEFAULT 'hostile'
                     CHECK (type IN ('hostile','climate','housing','service')),
  geohash          TEXT NOT NULL,          -- para clustering/dedupe barato
  status           TEXT NOT NULL DEFAULT 'reported'
                     CHECK (status IN ('reported','under_review','confirmed',
                                       'disputed','rejected','documented')),
  taxonomy_version INTEGER NOT NULL DEFAULT 1,
  score            REAL NOT NULL DEFAULT 0,  -- Σ pesos confirm − Σ pesos refute (normalizado)
  description      TEXT,
  address          TEXT,
  created_by       TEXT NOT NULL REFERENCES users(id),
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
-- Índice espacial POC: consulta por bounding-box del viewport.
CREATE INDEX IF NOT EXISTS idx_reports_bbox    ON reports(lat, lng);
CREATE INDEX IF NOT EXISTS idx_reports_geohash ON reports(geohash);
CREATE INDEX IF NOT EXISTS idx_reports_status  ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type    ON reports(type);

-- Categorías por reporte (N:M). category_key valida contra la taxonomía (docs/04 §4.2).
CREATE TABLE IF NOT EXISTS report_categories (
  report_id    TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  category_key TEXT NOT NULL CHECK (category_key IN (
                 'anti_lie_down','anti_sit','spikes','barrier',
                 'surface','surveillance','light_sound','ghost_amenity')),
  PRIMARY KEY (report_id, category_key)
);

-- Fotos: SIEMPRE difuminadas en cliente antes de subir (línea roja, docs/00 + docs/03 §3.6).
CREATE TABLE IF NOT EXISTS photos (
  id         TEXT PRIMARY KEY,
  report_id  TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  r2_key     TEXT NOT NULL,                          -- clave del objeto en R2
  blurred    INTEGER NOT NULL DEFAULT 1 CHECK (blurred = 1),  -- invariante: no se admite sin difuminar
  created_at INTEGER NOT NULL
);

-- Votos ponderados. weight se CONGELA en el momento del voto (docs/04 §4.4).
CREATE TABLE IF NOT EXISTS votes (
  id         TEXT PRIMARY KEY,
  report_id  TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id),
  value      INTEGER NOT NULL CHECK (value IN (-1, 1)),  -- +1 confirma, -1 refuta
  weight     REAL NOT NULL,                              -- snapshot de reputación
  created_at INTEGER NOT NULL,
  UNIQUE (report_id, user_id)                            -- un voto por usuario y reporte
);
CREATE INDEX IF NOT EXISTS idx_votes_report ON votes(report_id);

-- Contra-argumentos ("esto es accesibilidad legítima, no hostil").
CREATE TABLE IF NOT EXISTS counters (
  id         TEXT PRIMARY KEY,
  report_id  TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id),
  reason     TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Audit log de moderación: se conserva aunque el reporte se oculte.
CREATE TABLE IF NOT EXISTS moderation_log (
  id         TEXT PRIMARY KEY,
  report_id  TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  actor_id   TEXT NOT NULL REFERENCES users(id),
  action     TEXT NOT NULL,        -- e.g. 'confirm','reject','document','restore'
  note       TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_modlog_report ON moderation_log(report_id);

-- Auth de moderación (magic-link). Ver migración 0002 y worker/src/index.js.
-- Enlaces mágicos de un solo uso (solo se emiten a moderadores/admin).
CREATE TABLE IF NOT EXISTS login_tokens (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  expires_at  INTEGER NOT NULL,            -- epoch ms; TTL 15 min
  used        INTEGER NOT NULL DEFAULT 0,  -- 1 al canjearse (un solo uso)
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_tokens_user ON login_tokens(user_id);

-- Sesiones emitidas al canjear un enlace mágico (Bearer en /api/mod/*).
CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  role        TEXT NOT NULL,               -- copia del rol al emitir
  expires_at  INTEGER NOT NULL,            -- epoch ms; TTL 30 días
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
