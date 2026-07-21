-- ============================================================
-- 006_token_version.sql
-- Adds token_version to support instant session invalidation.
-- Incrementing a user's token_version immediately invalidates
-- every JWT issued to them before the increment, regardless of
-- the token's remaining expiry time.
-- ============================================================

ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 1;