-- ============================================================
-- 011_solutions.sql
-- Solutions: brand-specific service offerings, each presented as a
-- tile on the public Solutions page and backed by a downloadable PDF.
--
-- Solutions are deliberately separate from products: they represent
-- services rather than physical goods, and are organised by their own
-- categories rather than the product catalogue's.
-- ============================================================

CREATE TABLE solution_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE solutions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id      INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    category_id   INTEGER REFERENCES solution_categories(id) ON DELETE SET NULL,
    title         VARCHAR(200) NOT NULL,
    slug          VARCHAR(220) NOT NULL UNIQUE,
    short_desc    VARCHAR(300),
    description   TEXT,
    -- Hex colour for the tile shown on the Solutions listing page.
    tile_color    VARCHAR(7) NOT NULL DEFAULT '#0F1B2D',
    pdf_url       TEXT,
    is_published  BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    meta_title    VARCHAR(160),
    meta_description VARCHAR(300),
    created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_solutions_slug ON solutions(slug);
CREATE INDEX idx_solutions_brand ON solutions(brand_id);
CREATE INDEX idx_solutions_category ON solutions(category_id);
CREATE INDEX idx_solutions_published ON solutions(is_published);

CREATE TRIGGER trg_solutions_updated_at BEFORE UPDATE ON solutions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed the categories visible in the reference design. Admins can add more
-- directly in the database; there is no category management screen, matching
-- how product categories already work.
INSERT INTO solution_categories (name, slug, sort_order) VALUES
  ('Security Operations', 'security-operations', 1),
  ('Network Security', 'network-security', 2),
  ('Endpoint Security', 'endpoint-security', 3);