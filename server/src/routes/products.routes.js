const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { makeUploader, verifyImageContent } = require("../middleware/upload");
const { uniqueSlug } = require("../utils/slug");
const {
  sanitizePlainText,
  sanitizeRichText,
  sanitizeStringArray,
  sanitizeObjectStrings,
} = require("../utils/sanitize");
const { logAudit } = require("../utils/auditLog");

const router = express.Router();
const upload = makeUploader("products");

function toPublicUrl(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/products/${filename}`;
}

// -------------------- PUBLIC ROUTES --------------------

// GET /api/products?category=laptops&featured=true&search=pc&page=1&limit=12
router.get("/", async (req, res) => {
  const { category, featured, search, page = 1, limit = 12 } = req.query;
  const conditions = ["p.is_published = TRUE"];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (featured === "true") {
    conditions.push("p.is_featured = TRUE");
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(p.title ILIKE $${params.length} OR p.short_desc ILIKE $${params.length})`,
    );
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

  params.push(Number(limit), offset);

  const result = await db.query(
    `SELECT p.id, p.title, p.slug, p.short_desc, p.image_url, p.is_featured,
            c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN product_categories c ON c.id = p.category_id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const countResult = await db.query(
    `SELECT COUNT(*) FROM products p LEFT JOIN product_categories c ON c.id = p.category_id ${whereClause}`,
    params.slice(0, params.length - 2),
  );

  res.json({
    products: result.rows,
    total: Number(countResult.rows[0].count),
    page: Number(page),
    limit: Number(limit),
  });
});

// GET /api/products/categories
router.get("/categories", async (req, res) => {
  const result = await db.query(
    "SELECT id, name, slug FROM product_categories ORDER BY name",
  );
  res.json({ categories: result.rows });
});

// -------------------- ADMIN ROUTES --------------------
// NOTE: /admin/all must be registered BEFORE the generic GET /:slug
// route below, otherwise Express would match "admin" as a :slug value.

// GET /api/products/admin/all - includes unpublished, for the dashboard
router.get(
  "/admin/all",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT p.id, p.title, p.slug, p.is_published, p.is_featured, p.image_url,
            c.name AS category_name, p.updated_at
     FROM products p
     LEFT JOIN product_categories c ON c.id = p.category_id
     ORDER BY p.updated_at DESC`,
    );
    res.json({ products: result.rows });
  },
);

// GET /api/products/admin/:id - single product for editing, includes unpublished
router.get(
  "/admin/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN product_categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Product not found." });
    res.json({ product: result.rows[0] });
  },
);

// GET /api/products/:slug (public — must come after /admin/all)
router.get("/:slug", async (req, res) => {
  const result = await db.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN product_categories c ON c.id = p.category_id
     WHERE p.slug = $1 AND p.is_published = TRUE`,
    [req.params.slug],
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Product not found." });
  res.json({ product: result.rows[0] });
});

// POST /api/products - create
router.post(
  "/",
  requireAuth,
  requireRole("admin", "super_admin"),
  upload.single("image"),
  verifyImageContent,
  [body("title").trim().notEmpty(), body("categoryId").optional().isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "Title is required." });

    const {
      title: rawTitle,
      categoryId,
      shortDesc: rawShortDesc,
      description: rawDescription,
      specs,
      features,
      isPublished,
      isFeatured,
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
    const parsedSpecs = specs ? sanitizeObjectStrings(JSON.parse(specs)) : {};
    const parsedFeatures = features
      ? sanitizeStringArray(JSON.parse(features))
      : [];

    const slug = await uniqueSlug(db, "products", title);
    const imageUrl = toPublicUrl(req, req.file?.filename);

    const result = await db.query(
      `INSERT INTO products
        (category_id, title, slug, short_desc, description, specs, features,
         image_url, is_published, is_featured, meta_title, meta_description, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        categoryId || null,
        title,
        slug,
        shortDesc || null,
        description || null,
        parsedSpecs,
        parsedFeatures,
        imageUrl,
        isPublished !== "false",
        isFeatured === "true",
        metaTitle || null,
        metaDescription || null,
        req.user.id,
      ],
    );

    const product = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "product_create",
      resource: "product",
      resourceId: product.id,
      details: { title: product.title, slug: product.slug },
      req,
    });

    res.status(201).json({ product });
  },
);

// PUT /api/products/:id - update
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  upload.single("image"),
  verifyImageContent,
  async (req, res) => {
    const { id } = req.params;
    const {
      title: rawTitle,
      categoryId,
      shortDesc: rawShortDesc,
      description: rawDescription,
      specs,
      features,
      isPublished,
      isFeatured,
      metaTitle,
      metaDescription,
    } = req.body;

    const title = rawTitle ? sanitizePlainText(rawTitle) : rawTitle;
    const shortDesc = rawShortDesc
      ? sanitizePlainText(rawShortDesc)
      : rawShortDesc;
    const description = rawDescription
      ? sanitizeRichText(rawDescription)
      : rawDescription;

    const existing = await db.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Product not found." });

    let slug = existing.rows[0].slug;
    if (title && title !== existing.rows[0].title) {
      slug = await uniqueSlug(db, "products", title, id);
    }

    const imageUrl = req.file
      ? toPublicUrl(req, req.file.filename)
      : existing.rows[0].image_url;

    const result = await db.query(
      `UPDATE products SET
       category_id = $1, title = $2, slug = $3, short_desc = $4, description = $5,
       specs = $6, features = $7, image_url = $8, is_published = $9, is_featured = $10,
       meta_title = $11, meta_description = $12
     WHERE id = $13
     RETURNING *`,
      [
        categoryId || existing.rows[0].category_id,
        title || existing.rows[0].title,
        slug,
        shortDesc ?? existing.rows[0].short_desc,
        description ?? existing.rows[0].description,
        specs
          ? sanitizeObjectStrings(JSON.parse(specs))
          : existing.rows[0].specs,
        features
          ? sanitizeStringArray(JSON.parse(features))
          : existing.rows[0].features,
        imageUrl,
        isPublished !== undefined
          ? isPublished !== "false"
          : existing.rows[0].is_published,
        isFeatured !== undefined
          ? isFeatured === "true"
          : existing.rows[0].is_featured,
        metaTitle ?? existing.rows[0].meta_title,
        metaDescription ?? existing.rows[0].meta_description,
        id,
      ],
    );

    const product = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "product_update",
      resource: "product",
      resourceId: product.id,
      details: { title: product.title, slug: product.slug },
      req,
    });

    res.json({ product });
  },
);

// DELETE /api/products/:id

// DELETE /api/products/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      "DELETE FROM products WHERE id = $1 RETURNING id, title",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Product not found." });

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "product_delete",
      resource: "product",
      resourceId: result.rows[0].id,
      details: { title: result.rows[0].title },
      req,
    });

    res.json({ message: "Product deleted." });
  },
);

module.exports = router;
