-- Migración: añade la columna `type` a reports (tipo de exclusión).
-- schema.sql usa CREATE TABLE IF NOT EXISTS, que NO altera tablas existentes →
-- en una D1 ya creada hay que aplicar esta migración una vez:
--   wrangler d1 execute ciudad-justa --remote --file=db/migrations/0001-add-report-type.sql
-- (SQLite no permite CHECK en ADD COLUMN; la validación la hace el Worker.)
ALTER TABLE reports ADD COLUMN type TEXT NOT NULL DEFAULT 'hostile';
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
