const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { makeUploader, verifyImageContent } = require("../middleware/upload");
const { uniqueSlug } = require("../utils/slug");
const { sanitizePlainText, sanitizeRichText } = require("../utils/sanitize");
const { logAudit } = require("../utils/auditLog");

const router = express.Router();
const upload = makeUploader("news");

function toPublicUrl(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/news/${filename}`;
}

// -------------------- PUBLIC ROUTES --------------------

// GET /api/news?page=1&limit=9
router.get("/", async (req, res) => {
  const { page = 1, limit = 9, search } = req.query;
  const conditions = ["is_published = TRUE"];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(title ILIKE $${params.length} OR excerpt ILIKE $${params.length})`,
    );
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
  params.push(Number(limit), offset);

  const result = await db.query(
    `SELECT id, title, slug, excerpt, cover_image_url, published_at
     FROM news_posts
     ${whereClause}
     ORDER BY published_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const countResult = await db.query(
    `SELECT COUNT(*) FROM news_posts ${whereClause}`,
    params.slice(0, params.length - 2),
  );

  res.json({
    posts: result.rows,
    total: Number(countResult.rows[0].count),
    page: Number(page),
    limit: Number(limit),
  });
});

// -------------------- ADMIN ROUTES --------------------
// Registered before GET /:slug so "admin" isn't matched as a slug.

router.get(
  "/admin/all",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT id, title, slug, is_published, published_at, updated_at
     FROM news_posts ORDER BY updated_at DESC`,
    );
    res.json({ posts: result.rows });
  },
);

// GET /api/news/admin/:id - single post for editing, includes unpublished
router.get(
  "/admin/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT n.*, u.name AS author_name
       FROM news_posts n
       LEFT JOIN users u ON u.id = n.author_id
       WHERE n.id = $1`,
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Article not found." });
    res.json({ post: result.rows[0] });
  },
);

// GET /api/news/:slug (public)
router.get("/:slug", async (req, res) => {
  const result = await db.query(
    `SELECT n.*, u.name AS author_name
     FROM news_posts n
     LEFT JOIN users u ON u.id = n.author_id
     WHERE n.slug = $1 AND n.is_published = TRUE`,
    [req.params.slug],
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Article not found." });
  res.json({ post: result.rows[0] });
});

// POST /api/news - create
router.post(
  "/",
  requireAuth,
  requireRole("admin", "super_admin"),
  upload.single("coverImage"),
  verifyImageContent,
  [body("title").trim().notEmpty(), body("body").trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: "Title and body are required." });

    const {
      title: rawTitle,
      excerpt: rawExcerpt,
      body: rawBody,
      isPublished,
      metaTitle,
      metaDescription,
    } = req.body;

    const title = sanitizePlainText(rawTitle);
    const excerpt = rawExcerpt ? sanitizePlainText(rawExcerpt) : rawExcerpt;
    const content = sanitizeRichText(rawBody);

    const slug = await uniqueSlug(db, "news_posts", title);
    const coverImageUrl = toPublicUrl(req, req.file?.filename);

    const result = await db.query(
      `INSERT INTO news_posts
        (title, slug, excerpt, body, cover_image_url, is_published, published_at,
         meta_title, meta_description, author_id)
       VALUES ($1,$2,$3,$4,$5,$6, CASE WHEN $6 THEN now() ELSE NULL END, $7,$8,$9)
       RETURNING *`,
      [
        title,
        slug,
        excerpt || null,
        content,
        coverImageUrl,
        isPublished !== "false",
        metaTitle || null,
        metaDescription || null,
        req.user.id,
      ],
    );

    const post = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "news_create",
      resource: "news_post",
      resourceId: post.id,
      details: { title: post.title, slug: post.slug },
      req,
    });

    res.status(201).json({ post });
  },
);

// PUT /api/news/:id - update
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  upload.single("coverImage"),
  verifyImageContent,
  async (req, res) => {
    const { id } = req.params;
    const {
      title: rawTitle,
      excerpt: rawExcerpt,
      body: rawBody,
      isPublished,
      metaTitle,
      metaDescription,
    } = req.body;

    const title = rawTitle ? sanitizePlainText(rawTitle) : rawTitle;
    const excerpt = rawExcerpt ? sanitizePlainText(rawExcerpt) : rawExcerpt;
    const content = rawBody ? sanitizeRichText(rawBody) : rawBody;

    const existing = await db.query("SELECT * FROM news_posts WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Article not found." });

    let slug = existing.rows[0].slug;
    if (title && title !== existing.rows[0].title) {
      slug = await uniqueSlug(db, "news_posts", title, id);
    }

    const coverImageUrl = req.file
      ? toPublicUrl(req, req.file.filename)
      : existing.rows[0].cover_image_url;
    const willPublish =
      isPublished !== undefined
        ? isPublished !== "false"
        : existing.rows[0].is_published;
    const publishedAt =
      willPublish && !existing.rows[0].published_at
        ? new Date()
        : existing.rows[0].published_at;

    const result = await db.query(
      `UPDATE news_posts SET
       title = $1, slug = $2, excerpt = $3, body = $4, cover_image_url = $5,
       is_published = $6, published_at = $7, meta_title = $8, meta_description = $9
     WHERE id = $10
     RETURNING *`,
      [
        title || existing.rows[0].title,
        slug,
        excerpt ?? existing.rows[0].excerpt,
        content ?? existing.rows[0].body,
        coverImageUrl,
        willPublish,
        publishedAt,
        metaTitle ?? existing.rows[0].meta_title,
        metaDescription ?? existing.rows[0].meta_description,
        id,
      ],
    );

    const post = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "news_update",
      resource: "news_post",
      resourceId: post.id,
      details: { title: post.title, slug: post.slug },
      req,
    });

    res.json({ post });
  },
);

// DELETE /api/news/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      "DELETE FROM news_posts WHERE id = $1 RETURNING id, title",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Article not found." });

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "news_delete",
      resource: "news_post",
      resourceId: result.rows[0].id,
      details: { title: result.rows[0].title },
      req,
    });

    res.json({ message: "Article deleted." });
  },
);

module.exports = router;
