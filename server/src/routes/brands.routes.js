const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { makeUploader, verifyImageContent } = require("../middleware/upload");
const { uniqueSlug } = require("../utils/slug");
const { sanitizePlainText, sanitizeUrl } = require("../utils/sanitize");
const { logAudit } = require("../utils/auditLog");

const router = express.Router();
const upload = makeUploader("brands");

function toPublicUrl(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/brands/${filename}`;
}

// -------------------- PUBLIC ROUTES --------------------

// GET /api/brands - active brands, ordered for homepage display
router.get("/", async (req, res) => {
  const result = await db.query(
    `SELECT id, name, slug, logo_url, website_url, division
     FROM brands
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, name ASC`,
  );
  res.json({ brands: result.rows });
});

// -------------------- ADMIN ROUTES --------------------
// NOTE: /admin/all must come before /:id, same reasoning as products.routes.js

// GET /api/brands/admin/all - includes inactive, for the dashboard
router.get(
  "/admin/all",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT * FROM brands ORDER BY sort_order ASC, name ASC`,
    );
    res.json({ brands: result.rows });
  },
);

// GET /api/brands/admin/:id - single brand for editing
router.get(
  "/admin/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query("SELECT * FROM brands WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Brand not found." });
    res.json({ brand: result.rows[0] });
  },
);

// POST /api/brands - create
router.post(
  "/",
  requireAuth,
  requireRole("admin", "super_admin"),
  upload.single("logo"),
  verifyImageContent,
  [body("name").trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "Name is required." });

    if (!req.file) {
      return res.status(400).json({ error: "Logo image is required." });
    }

    const {
      name: rawName,
      websiteUrl: rawWebsiteUrl,
      sortOrder,
      isActive,
      division,
    } = req.body;
    const name = sanitizePlainText(rawName);
    const websiteUrl = rawWebsiteUrl
      ? sanitizeUrl(rawWebsiteUrl)
      : rawWebsiteUrl;
    const logoUrl = toPublicUrl(req, req.file.filename);
    const brandDivision =
      division === "commercial" ? "commercial" : "corporate";
    const slug = await uniqueSlug(db, "brands", name);

    const result = await db.query(
      `INSERT INTO brands (name, slug, logo_url, website_url, sort_order, is_active, division, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        slug,
        logoUrl,
        websiteUrl || null,
        sortOrder ? Number(sortOrder) : 0,
        isActive !== "false",
        brandDivision,
        req.user.id,
      ],
    );

    const brand = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "brand_create",
      resource: "brand",
      resourceId: brand.id,
      details: { name: brand.name },
      req,
    });

    res.status(201).json({ brand });
  },
);

// PUT /api/brands/:id - update
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  upload.single("logo"),
  verifyImageContent,
  async (req, res) => {
    const { id } = req.params;
    const {
      name: rawName,
      websiteUrl: rawWebsiteUrl,
      sortOrder,
      isActive,
      division,
    } = req.body;
    const websiteUrl = rawWebsiteUrl
      ? sanitizeUrl(rawWebsiteUrl)
      : rawWebsiteUrl;

    const existing = await db.query("SELECT * FROM brands WHERE id = $1", [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Brand not found." });

    const name = rawName ? sanitizePlainText(rawName) : existing.rows[0].name;
    const logoUrl = req.file
      ? toPublicUrl(req, req.file.filename)
      : existing.rows[0].logo_url;

    let slug = existing.rows[0].slug;
    if (name && name !== existing.rows[0].name) {
      slug = await uniqueSlug(db, "brands", name, id);
    }

    const result = await db.query(
      `UPDATE brands SET
       name = $1, slug = $2, logo_url = $3, website_url = $4, sort_order = $5, is_active = $6, division = $7
       WHERE id = $8
       RETURNING *`,
      [
        name,
        slug,
        logoUrl,
        websiteUrl ?? existing.rows[0].website_url,
        sortOrder !== undefined
          ? Number(sortOrder)
          : existing.rows[0].sort_order,
        isActive !== undefined
          ? isActive !== "false"
          : existing.rows[0].is_active,
        division === "commercial" || division === "corporate"
          ? division
          : existing.rows[0].division,
        id,
      ],
    );

    const brand = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "brand_update",
      resource: "brand",
      resourceId: brand.id,
      details: { name: brand.name },
      req,
    });

    res.json({ brand });
  },
);

// DELETE /api/brands/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      "DELETE FROM brands WHERE id = $1 RETURNING id, name",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Brand not found." });

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "brand_delete",
      resource: "brand",
      resourceId: result.rows[0].id,
      details: { name: result.rows[0].name },
      req,
    });

    res.json({ message: "Brand deleted." });
  },
);

module.exports = router;
