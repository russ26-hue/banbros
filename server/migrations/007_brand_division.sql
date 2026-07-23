-- ============================================================
-- 007_brand_division.sql
-- Splits brands into two groups for homepage display:
-- "corporate" and "commercial".
-- ============================================================

ALTER TABLE brands
  ADD COLUMN division VARCHAR(20) NOT NULL DEFAULT 'corporate'
  CHECK (division IN ('corporate', 'commercial'));

CREATE INDEX idx_brands_division ON brands(division);