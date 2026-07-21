-- ============================================================
-- 001_init.sql
-- Initial schema for corporate landing page + CMS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ------------------------------------------------------------
-- USERS & ROLES (IAM)
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('super_admin', 'admin');

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          user_role NOT NULL DEFAULT 'admin',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PRODUCT CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE product_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    short_desc      VARCHAR(300),
    description     TEXT,
    specs           JSONB DEFAULT '{}'::jsonb,
    features        TEXT[] DEFAULT '{}',
    image_url       TEXT,
    gallery         TEXT[] DEFAULT '{}',
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    meta_title      VARCHAR(160),
    meta_description VARCHAR(300),
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_published ON products(is_published);

-- ------------------------------------------------------------
-- NEWS / BLOG
-- ------------------------------------------------------------
CREATE TABLE news_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    excerpt         VARCHAR(300),
    body            TEXT NOT NULL,
    cover_image_url TEXT,
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    published_at    TIMESTAMPTZ DEFAULT now(),
    meta_title      VARCHAR(160),
    meta_description VARCHAR(300),
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_slug ON news_posts(slug);
CREATE INDEX idx_news_published ON news_posts(is_published, published_at DESC);

-- ------------------------------------------------------------
-- CMS CONTENT BLOCKS (editable landing page copy)
-- ------------------------------------------------------------
CREATE TABLE cms_sections (
    id          SERIAL PRIMARY KEY,
    page        VARCHAR(60) NOT NULL,
    section_key VARCHAR(80) NOT NULL,
    content     JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (page, section_key)
);

-- ------------------------------------------------------------
-- CONTACT / INQUIRY SUBMISSIONS
-- ------------------------------------------------------------
CREATE TABLE contact_submissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),
    subject     VARCHAR(200),
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Trigger: keep updated_at fresh
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_news_updated_at BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();