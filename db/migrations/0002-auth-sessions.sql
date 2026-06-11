-- 0002 · Auth de sesión real (magic-link) para moderación.
-- Sustituye al secreto compartido MOD_TOKEN (que se conserva como fallback).
-- Ver worker/src/index.js (/api/auth/magic, /api/auth/verify, resolveActor) y docs/06 §6.4.

-- Enlaces mágicos de un solo uso: se emiten solo a emails de moderadores/admin.
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
  role        TEXT NOT NULL,               -- copia del rol al emitir (revalidar en cambios)
  expires_at  INTEGER NOT NULL,            -- epoch ms; TTL 30 días
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
