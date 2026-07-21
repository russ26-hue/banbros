const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { sanitizePlainText } = require("../utils/sanitize");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { error: "Too many submissions. Please try again later." },
});

// POST /api/contact - public "Contact Us" form
router.post(
  "/",
  contactLimiter,
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("message").trim().isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Name, valid email, and a message are required." });
    }

    const name = sanitizePlainText(req.body.name);
    const email = req.body.email; // validated as a proper email format above, not HTML
    const phone = req.body.phone ? sanitizePlainText(req.body.phone) : null;
    const subject = req.body.subject
      ? sanitizePlainText(req.body.subject)
      : null;
    const message = sanitizePlainText(req.body.message);

    const result = await db.query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
      [name, email, phone, subject, message],
    );

    res.status(201).json({
      message: "Thanks for reaching out — we'll get back to you soon.",
      id: result.rows[0].id,
    });
  },
);

// GET /api/contact - admin inbox
router.get(
  "/",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      "SELECT * FROM contact_submissions ORDER BY created_at DESC",
    );
    res.json({ submissions: result.rows });
  },
);

// PATCH /api/contact/:id/read - mark as read
router.patch(
  "/:id/read",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const result = await db.query(
      "UPDATE contact_submissions SET is_read = TRUE WHERE id = $1 RETURNING id",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Submission not found." });
    res.json({ message: "Marked as read." });
  },
);

module.exports = router;
