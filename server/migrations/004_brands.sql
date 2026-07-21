-- ============================================================
-- 004_brands.sql
-- Brands table for homepage brand showcase grid
-- ============================================================
CREATE TABLE
    brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        logo_url TEXT NOT NULL,
        website_url TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by UUID REFERENCES users (id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE INDEX idx_brands_active_sort ON brands (is_active, sort_order);

CREATE TRIGGER trg_brands_updated_at BEFORE
UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION set_updated_at ();