const express = require("express");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireRole("admin", "super_admin"));

// GET /api/notifications - unread inquiries and applications, newest first.
//
// Notifications are derived from existing records rather than stored
// separately, so there is no risk of the two drifting out of sync.
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const contacts = await db.query(
    `SELECT id, name, subject, created_at
     FROM contact_submissions
     WHERE is_read = FALSE
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );

  const applications = await db.query(
    `SELECT a.id, a.applicant_name, a.submitted_at, j.title AS job_title
     FROM job_applications a
     LEFT JOIN job_postings j ON j.id = a.job_posting_id
     WHERE a.is_read = FALSE
     ORDER BY a.submitted_at DESC
     LIMIT $1`,
    [limit],
  );

  const items = [
    ...contacts.rows.map((row) => ({
      id: row.id,
      type: "contact",
      title: row.name,
      description: row.subject || "New enquiry",
      createdAt: row.created_at,
      href: "/admin/contact",
    })),
    ...applications.rows.map((row) => ({
      id: row.id,
      type: "application",
      title: row.applicant_name,
      description: row.job_title
        ? `Applied for ${row.job_title}`
        : "New application",
      createdAt: row.submitted_at,
      href: "/admin/careers",
    })),
  ];

  // Merge both sources into one chronological feed.
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    notifications: items.slice(0, limit),
    unreadCount: items.length,
  });
});

// PATCH /api/notifications/applications/:id/read - mark one application read.
// Contact submissions already have an equivalent endpoint in contact.routes.js.
router.patch("/applications/:id/read", async (req, res) => {
  const result = await db.query(
    "UPDATE job_applications SET is_read = TRUE WHERE id = $1 RETURNING id",
    [req.params.id],
  );
  if (result.rows.length === 0)
    return res.status(404).json({ error: "Application not found." });
  res.json({ message: "Marked as read." });
});

// PATCH /api/notifications/read-all - clears everything at once.
router.patch("/read-all", async (req, res) => {
  await db.query(
    "UPDATE contact_submissions SET is_read = TRUE WHERE is_read = FALSE",
  );
  await db.query(
    "UPDATE job_applications SET is_read = TRUE WHERE is_read = FALSE",
  );
  res.json({ message: "All notifications marked as read." });
});

module.exports = router;
