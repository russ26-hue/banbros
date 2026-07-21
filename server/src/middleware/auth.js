const jwt = require("jsonwebtoken");
const db = require("../config/db");

/**
 * Verifies the Bearer JWT, checks it hasn't been revoked (logged out),
 * and attaches { id, email, role, jti } to req.user.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  // Tokens issued before we added revocation won't have a jti — treat those as valid
  // (they'll simply expire naturally). Only check revocation when a jti is present.
  if (payload.jti) {
    try {
      const revoked = await db.query(
        "SELECT jti FROM revoked_tokens WHERE jti = $1",
        [payload.jti],
      );
      if (revoked.rows.length > 0) {
        return res
          .status(401)
          .json({
            error: "This session has been logged out. Please log in again.",
          });
      }
    } catch (err) {
      console.error("Revocation check failed:", err.message);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  req.user = payload;
  return next();
}

/**
 * Restricts a route to one or more roles.
 * Usage: requireRole('super_admin') or requireRole('super_admin', 'admin')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "You do not have permission to perform this action." });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
