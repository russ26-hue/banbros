-- ============================================================
-- 008_product_brand_link.sql
-- Adds a slug to brands (for clean filter URLs) and links
-- products to a single brand.
-- ============================================================

ALTER TABLE brands ADD COLUMN slug VARCHAR(150);

-- Backfill existing brands with a slug derived from their name
-- (lowercase, non-alphanumeric characters replaced with hyphens).
-- New brands created going forward will have their slug generated
-- properly by the application (handling duplicates), same as
-- products/news/job postings already do.
UPDATE brands
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

ALTER TABLE brands ALTER COLUMN slug SET NOT NULL;
ALTER TABLE brands ADD CONSTRAINT brands_slug_unique UNIQUE (slug);

ALTER TABLE products
  ADD COLUMN brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX idx_products_brand ON products(brand_id);