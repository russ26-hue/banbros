-- ============================================================
-- 003_security.sql
-- Adds support for:
--   - Account lockout after repeated failed logins
--   - Audit logging of sensitive actions
--   - Secure logout via token revocation
-- ============================================================

-- ------------------------------------------------------------
-- ACCOUNT LOCKOUT TRACKING
-- ------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN locked_until TIMESTAMPTZ,
  ADD COLUMN last_login_at TIMESTAMPTZ;

-- ------------------------------------------------------------
-- AUDIT LOG
-- Records who did what, when, to which resource.
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email   VARCHAR(255),              -- kept even if user is later deleted
    action       VARCHAR(100) NOT NULL,     -- e.g. 'login', 'login_failed', 'product_create'
    resource     VARCHAR(100),              -- e.g. 'product', 'news_post', 'user'
    resource_id  VARCHAR(100),              -- id of the affected row, as text
    details      JSONB DEFAULT '{}'::jsonb, -- extra context (never store passwords/tokens here)
    ip_address   VARCHAR(64),
    user_agent   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ------------------------------------------------------------
-- TOKEN REVOCATION (secure logout)
-- Each issued JWT gets a unique "jti" claim. Logging out inserts
-- that jti here; the auth middleware checks this table on every
-- request so a "logged out" token stops working immediately,
-- instead of staying valid until it naturally expires.
-- ------------------------------------------------------------
CREATE TABLE revoked_tokens (
    jti         UUID PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    revoked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ NOT NULL  -- matches the JWT's own expiry, so we can clean up old rows
);

CREATE INDEX idx_revoked_tokens_expires ON revoked_tokens(expires_at);