const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  makeDocumentUploader,
  verifyDocumentContent,
} = require("../middleware/upload");
const { uniqueSlug } = require("../utils/slug");
const { sanitizePlainText, sanitizeRichText } = require("../utils/sanitize");
const { logAudit } = require("../utils/auditLog");

const router = express.Router();
const pdfUploader = makeDocumentUploader("solutions");

function toPublicUrl(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/solutions/${filename}`;
}

// Tile colours are rendered directly into a style attribute, so only accept
// a plain hex value rather than trusting whatever arrives.
function safeTileColor(value, fallback = "#0F1B2D") {
  if (typeof value !== "string") return fallback;
  return /^#[0-9A-Fa-f]{6}$/.test(value.trim()) ? value.trim() : fallback;
}

// -------------------- PUBLIC ROUTES --------------------

// GET /api/solutions?brand=viettel&category=network-security&search=soc
router.get("/", async (req, res) => {
  const { brand, category, search } = req.query;
  const conditions = ["s.is_published = TRUE"];
  const params = [];

  if (brand) {
    params.push(brand);
    conditions.push(`b.slug = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(s.title ILIKE $${params.length} OR s.short_desc ILIKE $${params.length})`,
    );
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const result = await db.query(
    `SELECT s.id, s.title, s.slug, s.short_desc, s.tile_color,
            b.name AS brand_name, b.slug AS brand_slug,
            c.name AS category_name, c.slug AS category_slug
     FROM solutions s
     LEFT JOIN brands b ON b.id = s.brand_id
     LEFT JOIN solution_categories c ON c.id = s.category_id
     ${whereClause}
     ORDER BY s.sort_order ASC, s.title ASC`,
    params,
  );

  res.json({ solutions: result.rows });
});

// GET /api/solutions/categories
router.get("/categories", async (req, res) => {
  const result = await db.query(
    "SELECT id, name, slug FROM solution_categories ORDER BY sort_order ASC, name ASC",
  );
  res.json({ categories: result.rows });
});

// GET /api/solutions/brands - only brands that actually have published
// solutions, so the filter sidebar does not offer choices that lead nowhere.
router.get("/brands", async (req, res) => {
  const result = await db.query(
    `SELECT DISTINCT b.id, b.name, b.slug
     FROM brands b
     INNER JOIN solutions s ON s.brand_id = b.id AND s.is_published = TRUE
     WHERE b.is_active = TRUE
     ORDER BY b.name ASC`,
  );
  res.json({ brands: result.rows });
});

// -------------------- ADMIN ROUTES --------------------
// NOTE: /admin/* must be registered before the generic GET /:slug below,
// otherwise Express would match "admin" as a slug value.

router.get(
  "/admin/all",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT s.id, s.title, s.slug, s.is_published, s.sort_order, s.tile_color,
              s.pdf_url, s.updated_at,
              b.name AS brand_name, c.name AS category_name
       FROM solutions s
       LEFT JOIN brands b ON b.id = s.brand_id
       LEFT JOIN solution_categories c ON c.id = s.category_id
       ORDER BY s.updated_at DESC`,
    );
    res.json({ solutions: result.rows });
  },
);

router.get(
  "/admin/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT s.*, b.name AS brand_name, c.name AS category_name
       FROM solutions s
       LEFT JOIN brands b ON b.id = s.brand_id
       LEFT JOIN solution_categories c ON c.id = s.category_id
       WHERE s.id = $1`,
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Solution not found." });
    res.json({ solution: result.rows[0] });
  },
);

// GET /api/solutions/:slug (public — must come after /admin/*)
router.get("/:slug", async (req, res) => {
  const result = await db.query(
    `SELECT s.*, b.name AS brand_name, b.slug AS brand_slug,
            c.name AS category_name, c.slug AS category_slug
     FROM solutions s
     LEFT JOIN brands b ON b.id = s.brand_id
     LEFT JOIN solution_categories c ON c.id = s.category_id
     WHERE s.slug = $1 AND s.is_published = TRUE`,
    [req.params.slug],
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Solution not found." });
  res.json({ solution: result.rows[0] });
});

// POST /api/solutions - create
router.post(
  "/",
  requireAuth,
  requireRole("admin", "super_admin"),
  pdfUploader.single("pdf"),
  verifyDocumentContent,
  [body("title").trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "Title is required." });

    const {
      title: rawTitle,
      brandId,
      categoryId,
      shortDesc: rawShortDesc,
      description: rawDescription,
      tileColor,
      isPublished,
      sortOrder,
      metaTitle,
      metaDescription,
    } = req.body;

    const title = sanitizePlainText(rawTitle);
    const shortDesc = rawShortDesc
      ? sanitizePlainText(rawShortDesc)
      : rawShortDesc;
    const description = rawDescription
      ? sanitizeRichText(rawDescription)
      : rawDescription;

    const slug = await uniqueSlug(db, "solutions", title);
    const pdfUrl = toPublicUrl(req, req.file?.filename);

    const result = await db.query(
      `INSERT INTO solutions
        (brand_id, category_id, title, slug, short_desc, description,
         tile_color, pdf_url, is_published, sort_order,
         meta_title, meta_description, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        brandId || null,
        categoryId || null,
        title,
        slug,
        shortDesc || null,
        description || null,
        safeTileColor(tileColor),
        pdfUrl,
        isPublished !== "false",
        sortOrder ? Number(sortOrder) : 0,
        metaTitle || null,
        metaDescription || null,
        req.user.id,
      ],
    );

    const solution = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "solution_create",
      resource: "solution",
      resourceId: solution.id,
      details: { title: solution.title, slug: solution.slug },
      req,
    });

    res.status(201).json({ solution });
  },
);

// PUT /api/solutions/:id - update
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  pdfUploader.single("pdf"),
  verifyDocumentContent,
  async (req, res) => {
    const { id } = req.params;
    const {
      title: rawTitle,
      brandId,
      categoryId,
      shortDesc: rawShortDesc,
      description: rawDescription,
      tileColor,
      isPublished,
      sortOrder,
      metaTitle,
      metaDescription,
    } = req.body;

    const existing = await db.query("SELECT * FROM solutions WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Solution not found." });

    const current = existing.rows[0];

    const title = rawTitle ? sanitizePlainText(rawTitle) : rawTitle;
    const shortDesc = rawShortDesc
      ? sanitizePlainText(rawShortDesc)
      : rawShortDesc;
    const description = rawDescription
      ? sanitizeRichText(rawDescription)
      : rawDescription;

    let slug = current.slug;
    if (title && title !== current.title) {
      slug = await uniqueSlug(db, "solutions", title, id);
    }

    // Keep the existing PDF unless a new one was uploaded.
    const pdfUrl = req.file
      ? toPublicUrl(req, req.file.filename)
      : current.pdf_url;

    const result = await db.query(
      `UPDATE solutions SET
         brand_id = $1, category_id = $2, title = $3, slug = $4,
         short_desc = $5, description = $6, tile_color = $7, pdf_url = $8,
         is_published = $9, sort_order = $10, meta_title = $11,
         meta_description = $12
       WHERE id = $13
       RETURNING *`,
      [
        brandId || current.brand_id,
        categoryId || current.category_id,
        title || current.title,
        slug,
        shortDesc ?? current.short_desc,
        description ?? current.description,
        tileColor
          ? safeTileColor(tileColor, current.tile_color)
          : current.tile_color,
        pdfUrl,
        isPublished !== undefined
          ? isPublished !== "false"
          : current.is_published,
        sortOrder !== undefined ? Number(sortOrder) : current.sort_order,
        metaTitle ?? current.meta_title,
        metaDescription ?? current.meta_description,
        id,
      ],
    );

    const solution = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "solution_update",
      resource: "solution",
      resourceId: solution.id,
      details: { title: solution.title, slug: solution.slug },
      req,
    });

    res.json({ solution });
  },
);

// DELETE /api/solutions/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      "DELETE FROM solutions WHERE id = $1 RETURNING id, title",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Solution not found." });

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "solution_delete",
      resource: "solution",
      resourceId: result.rows[0].id,
      details: { title: result.rows[0].title },
      req,
    });

    res.json({ message: "Solution deleted." });
  },
);

module.exports = router;
