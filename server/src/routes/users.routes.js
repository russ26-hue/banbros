const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { logAudit } = require("../utils/auditLog");

const router = express.Router();

// Every route here requires a logged-in Super Admin.
router.use(requireAuth, requireRole("super_admin"));

// GET /api/users - list all admins & super admins
router.get("/", async (req, res) => {
  const result = await db.query(
    `SELECT id, name, email, role, is_active, created_at
     FROM users ORDER BY created_at DESC`,
  );
  res.json({ users: result.rows });
});

// POST /api/users - create a new Admin
router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Name, valid email, and password (min 8 chars) are required.",
      });
    }

    const { name, email, password } = req.body;

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "A user with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role, created_by)
       VALUES ($1, $2, $3, 'admin', $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, passwordHash, req.user.id],
    );

    const newUser = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "admin_created",
      resource: "user",
      resourceId: newUser.id,
      details: { name: newUser.name, email: newUser.email },
      req,
    });

    res.status(201).json({ user: newUser });
  },
);

// PATCH /api/users/:id - update name/active status
router.patch(
  "/:id",
  [
    body("name").optional().trim().notEmpty(),
    body("isActive").optional().isBoolean(),
  ],
  async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;

    if (id === req.user.id && isActive === false) {
      return res
        .status(400)
        .json({ error: "You cannot deactivate your own account." });
    }

    const target = await db.query("SELECT role FROM users WHERE id = $1", [id]);
    if (target.rows.length === 0)
      return res.status(404).json({ error: "User not found." });
    if (target.rows[0].role === "super_admin" && id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Super Admin accounts cannot be modified here." });
    }

    const result = await db.query(
      `UPDATE users SET
       name = COALESCE($1, name),
       is_active = COALESCE($2, is_active)
     WHERE id = $3
     RETURNING id, name, email, role, is_active, created_at`,
      [name ?? null, isActive ?? null, id],
    );

    const updatedUser = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action:
        isActive === false
          ? "admin_deactivated"
          : isActive === true
            ? "admin_reactivated"
            : "admin_updated",
      resource: "user",
      resourceId: updatedUser.id,
      details: {
        name: updatedUser.name,
        email: updatedUser.email,
        isActive: updatedUser.is_active,
      },
      req,
    });

    res.json({ user: updatedUser });
  },
);

// DELETE /api/users/:id - revoke an Admin's access
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    return res
      .status(400)
      .json({ error: "You cannot remove your own account." });
  }

  const target = await db.query("SELECT role FROM users WHERE id = $1", [id]);
  if (target.rows.length === 0)
    return res.status(404).json({ error: "User not found." });
  if (target.rows[0].role === "super_admin") {
    return res
      .status(403)
      .json({ error: "Super Admin accounts cannot be removed." });
  }

  await db.query("UPDATE users SET is_active = FALSE WHERE id = $1", [id]);

  await logAudit({
    userId: req.user.id,
    userEmail: req.user.email,
    action: "admin_revoked",
    resource: "user",
    resourceId: id,
    req,
  });

  res.json({ message: "Admin access revoked." });
});

module.exports = router;
