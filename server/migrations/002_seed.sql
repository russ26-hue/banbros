-- ============================================================
-- 002_seed.sql
-- Seed data. Run this AFTER 001_init.sql.
-- NOTE: The super admin account is NOT created here, because its
-- password must be bcrypt-hashed at creation time. We create it
-- with a separate script (npm run seed) instead.
-- ============================================================

INSERT INTO product_categories (name, slug) VALUES
  ('Desktops', 'desktops'),
  ('Laptops', 'laptops'),
  ('Components', 'components'),
  ('Peripherals', 'peripherals'),
  ('Networking', 'networking')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cms_sections (page, section_key, content) VALUES
  ('home', 'hero', '{
    "eyebrow": "Trusted Technology Partner",
    "title": "Powering Your Digital Future",
    "subtitle": "Enterprise-grade hardware, components, and IT solutions built for performance.",
    "cta_label": "Explore Products",
    "cta_url": "/products",
    "image_url": ""
  }'::jsonb),
  ('home', 'purpose_statement', '{
    "title": "Our Purpose",
    "body": "We deliver reliable technology solutions that help businesses and individuals work smarter, connect faster, and grow further."
  }'::jsonb),
  ('home', 'featured_products_heading', '{
    "title": "Featured Products",
    "subtitle": "A closer look at our top picks"
  }'::jsonb),
  ('home', 'latest_news_heading', '{
    "title": "Latest News",
    "subtitle": "Stay updated with our newest releases and announcements"
  }'::jsonb),
  ('contact', 'info', '{
    "address": "123 Business Ave, Makati City, Philippines",
    "phone": "+63 2 1234 5678",
    "email": "info@banbros.com",
    "hours": "Mon - Fri, 9:00 AM - 6:00 PM"
  }'::jsonb),
  ('global', 'company_info', '{
    "company_name": "Banbros Inc.",
    "tagline": "Powering Your Digital Future",
    "logo_url": "",
    "facebook_url": "",
    "twitter_url": "",
    "linkedin_url": ""
  }'::jsonb)
ON CONFLICT (page, section_key) DO NOTHING;