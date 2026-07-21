const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  makeDocumentUploader,
  verifyDocumentContent,
} = require("../middleware/upload");
const { uniqueSlug } = require("../utils/slug");
const {
  sanitizePlainText,
  sanitizeRichText,
  sanitizeStringArray,
} = require("../utils/sanitize");
const { logAudit } = require("../utils/auditLog");

const router = express.Router();
const resumeUploader = makeDocumentUploader("resumes");

function toResumeUrl(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/resumes/${filename}`;
}

// -------------------- PUBLIC ROUTES --------------------

// GET /api/careers - active job postings
router.get("/", async (req, res) => {
  const result = await db.query(
    `SELECT id, title, slug, description, qualifications, created_at
     FROM job_postings
     WHERE is_active = TRUE
     ORDER BY created_at DESC`,
  );
  res.json({ jobs: result.rows });
});

// -------------------- ADMIN ROUTES (job postings) --------------------
// NOTE: /admin/* must be registered before /:slug, same reasoning as
// products/news/brands routes.

router.get(
  "/admin/all",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT id, title, slug, is_active, created_at, updated_at
       FROM job_postings ORDER BY updated_at DESC`,
    );
    res.json({ jobs: result.rows });
  },
);

router.get(
  "/admin/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query("SELECT * FROM job_postings WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Job posting not found." });
    res.json({ job: result.rows[0] });
  },
);

// GET /api/careers/:slug (public — must come after /admin/*)
router.get("/:slug", async (req, res) => {
  const result = await db.query(
    `SELECT * FROM job_postings WHERE slug = $1 AND is_active = TRUE`,
    [req.params.slug],
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Job posting not found." });
  res.json({ job: result.rows[0] });
});

// POST /api/careers - create job posting
router.post(
  "/",
  requireAuth,
  requireRole("admin", "super_admin"),
  [body("title").trim().notEmpty(), body("description").trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ error: "Title and description are required." });

    const {
      title: rawTitle,
      description: rawDescription,
      qualifications,
      isActive,
    } = req.body;

    const title = sanitizePlainText(rawTitle);
    const description = sanitizeRichText(rawDescription);
    const parsedQualifications = qualifications
      ? sanitizeStringArray(JSON.parse(qualifications))
      : [];

    const slug = await uniqueSlug(db, "job_postings", title);

    const result = await db.query(
      `INSERT INTO job_postings (title, slug, description, qualifications, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        slug,
        description,
        parsedQualifications,
        isActive !== "false",
        req.user.id,
      ],
    );

    const job = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "job_posting_create",
      resource: "job_posting",
      resourceId: job.id,
      details: { title: job.title, slug: job.slug },
      req,
    });

    res.status(201).json({ job });
  },
);

// PUT /api/careers/:id - update job posting
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const { id } = req.params;
    const {
      title: rawTitle,
      description: rawDescription,
      qualifications,
      isActive,
    } = req.body;

    const existing = await db.query(
      "SELECT * FROM job_postings WHERE id = $1",
      [id],
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Job posting not found." });

    const title = rawTitle ? sanitizePlainText(rawTitle) : rawTitle;
    const description = rawDescription
      ? sanitizeRichText(rawDescription)
      : rawDescription;

    let slug = existing.rows[0].slug;
    if (title && title !== existing.rows[0].title) {
      slug = await uniqueSlug(db, "job_postings", title, id);
    }

    const result = await db.query(
      `UPDATE job_postings SET
       title = $1, slug = $2, description = $3, qualifications = $4, is_active = $5
       WHERE id = $6
       RETURNING *`,
      [
        title || existing.rows[0].title,
        slug,
        description ?? existing.rows[0].description,
        qualifications
          ? sanitizeStringArray(JSON.parse(qualifications))
          : existing.rows[0].qualifications,
        isActive !== undefined
          ? isActive !== "false"
          : existing.rows[0].is_active,
        id,
      ],
    );

    const job = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "job_posting_update",
      resource: "job_posting",
      resourceId: job.id,
      details: { title: job.title, slug: job.slug },
      req,
    });

    res.json({ job });
  },
);

// DELETE /api/careers/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      "DELETE FROM job_postings WHERE id = $1 RETURNING id, title",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Job posting not found." });

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "job_posting_delete",
      resource: "job_posting",
      resourceId: result.rows[0].id,
      details: { title: result.rows[0].title },
      req,
    });

    res.json({ message: "Job posting deleted." });
  },
);

// -------------------- APPLICATIONS --------------------

// POST /api/careers/:id/apply - public, submits an application with resume upload
router.post(
  "/:id/apply",
  resumeUploader.single("resume"),
  verifyDocumentContent,
  [body("applicantName").trim().notEmpty(), body("applicantEmail").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ error: "Name and a valid email are required." });

    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required." });
    }

    const { id: jobPostingId } = req.params;
    const {
      applicantName: rawName,
      applicantEmail,
      coverLetter: rawCoverLetter,
    } = req.body;

    const job = await db.query(
      "SELECT id FROM job_postings WHERE id = $1 AND is_active = TRUE",
      [jobPostingId],
    );
    if (job.rows.length === 0)
      return res.status(404).json({ error: "Job posting not found." });

    const applicantName = sanitizePlainText(rawName);
    const coverLetter = rawCoverLetter
      ? sanitizePlainText(rawCoverLetter)
      : null;
    const resumeUrl = toResumeUrl(req, req.file.filename);

    const result = await db.query(
      `INSERT INTO job_applications
        (job_posting_id, applicant_name, applicant_email, resume_url, cover_letter)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, submitted_at`,
      [jobPostingId, applicantName, applicantEmail, resumeUrl, coverLetter],
    );

    await logAudit({
      userId: null,
      userEmail: applicantEmail,
      action: "job_application_submit",
      resource: "job_application",
      resourceId: result.rows[0].id,
      details: { jobPostingId, applicantName },
      req,
    });

    res.status(201).json({
      message: "Application submitted successfully.",
      id: result.rows[0].id,
    });
  },
);

// GET /api/careers/:id/applications - admin, view submissions for a posting
router.get(
  "/:id/applications",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      `SELECT id, applicant_name, applicant_email, resume_url, cover_letter, submitted_at
       FROM job_applications
       WHERE job_posting_id = $1
       ORDER BY submitted_at DESC`,
      [req.params.id],
    );
    res.json({ applications: result.rows });
  },
);

module.exports = router;
