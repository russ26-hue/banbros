const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const {
  isStrongPassword,
  PASSWORD_POLICY_MESSAGE,
} = require("../utils/passwordPolicy");
const { logAudit } = require("../utils/auditLog");

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true, // only count failed attempts toward the limit
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Valid email and password are required." });
    }

    const { email, password } = req.body;

    const result = await db.query(
      `SELECT id, name, email, password_hash, role, is_active, token_version,
              failed_login_attempts, locked_until
       FROM users WHERE email = $1`,
      [email],
    );
    const user = result.rows[0];

    const genericError = () =>
      res.status(401).json({ error: "Invalid email or password." });

    // Dummy hash with the same bcrypt cost factor (10) used for real users.
    // Comparing against this when no user is found keeps response timing
    // consistent with a real "wrong password" case, so timing alone can't
    // reveal whether an email address exists in the system.
    const DUMMY_HASH =
      "$2a$10$CwTycUXWue0Thq9StjUM0uJ8vHNRXqIvNzt5vQBQXymUYcLNXzr.a";

    if (!user || !user.is_active) {
      await bcrypt.compare(password, DUMMY_HASH);
      await logAudit({
        userEmail: email,
        action: "login_failed",
        details: { reason: "no_such_user_or_inactive" },
        req,
      });
      return genericError();
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(user.locked_until) - new Date()) / 60000,
      );
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: "login_blocked_locked",
        req,
      });
      return res.status(423).json({
        error: `Account temporarily locked due to repeated failed login attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      const attempts = user.failed_login_attempts + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

      await db.query(
        `UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
        [
          shouldLock ? 0 : attempts,
          shouldLock
            ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
            : null,
          user.id,
        ],
      );

      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: shouldLock ? "account_locked" : "login_failed",
        details: { attempts },
        req,
      });

      return genericError();
    }

    // Successful login
    await db.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = now()
       WHERE id = $1`,
      [user.id],
    );

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: "login_success",
      req,
    });

    const jti = crypto.randomUUID();
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.token_version,
        jti,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  },
);

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const result = await db.query(
    "SELECT id, name, email, role, last_login_at, created_at FROM users WHERE id = $1",
    [req.user.id],
  );
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user });
});

// PUT /api/auth/password
router.put(
  "/password",
  requireAuth,
  [body("currentPassword").notEmpty(), body("newPassword").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Current and new password are required." });
    }

    const { currentPassword, newPassword } = req.body;

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ error: PASSWORD_POLICY_MESSAGE });
    }

    const result = await db.query(
      "SELECT password_hash, email FROM users WHERE id = $1",
      [req.user.id],
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found." });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      await logAudit({
        userId: req.user.id,
        userEmail: user.email,
        action: "password_change_failed",
        req,
      });
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password_hash = $1, token_version = token_version + 1 WHERE id = $2",
      [newHash, req.user.id],
    );

    await logAudit({
      userId: req.user.id,
      userEmail: user.email,
      action: "password_changed",
      req,
    });

    return res.json({ message: "Password updated successfully." });
  },
);

// POST /api/auth/logout
router.post("/logout", requireAuth, async (req, res) => {
  const { jti, exp } = req.user;

  if (jti) {
    await db.query(
      `INSERT INTO revoked_tokens (jti, user_id, expires_at)
       VALUES ($1, $2, to_timestamp($3))
       ON CONFLICT (jti) DO NOTHING`,
      [jti, req.user.id, exp],
    );
  }

  await logAudit({
    userId: req.user.id,
    userEmail: req.user.email,
    action: "logout",
    req,
  });

  res.json({ message: "Logged out successfully." });
});

module.exports = router;
