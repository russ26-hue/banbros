const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { makeUploader, verifyImageContent } = require("../middleware/upload");
const { sanitizePlainText } = require("../utils/sanitize");
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
    `SELECT id, name, logo_url, website_url
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

    const { name: rawName, websiteUrl, sortOrder, isActive } = req.body;
    const name = sanitizePlainText(rawName);
    const logoUrl = toPublicUrl(req, req.file.filename);

    const result = await db.query(
      `INSERT INTO brands (name, logo_url, website_url, sort_order, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        logoUrl,
        websiteUrl || null,
        sortOrder ? Number(sortOrder) : 0,
        isActive !== "false",
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
    const { name: rawName, websiteUrl, sortOrder, isActive } = req.body;

    const existing = await db.query("SELECT * FROM brands WHERE id = $1", [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Brand not found." });

    const name = rawName ? sanitizePlainText(rawName) : existing.rows[0].name;
    const logoUrl = req.file
      ? toPublicUrl(req, req.file.filename)
      : existing.rows[0].logo_url;

    const result = await db.query(
      `UPDATE brands SET
       name = $1, logo_url = $2, website_url = $3, sort_order = $4, is_active = $5
       WHERE id = $6
       RETURNING *`,
      [
        name,
        logoUrl,
        websiteUrl ?? existing.rows[0].website_url,
        sortOrder !== undefined
          ? Number(sortOrder)
          : existing.rows[0].sort_order,
        isActive !== undefined
          ? isActive !== "false"
          : existing.rows[0].is_active,
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
