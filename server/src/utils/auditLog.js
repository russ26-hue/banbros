const db = require("../config/db");

/**
 * Records an entry in the audit log. Never pass passwords, tokens,
 * or other secrets in `details` — only non-sensitive context.
 *
 * @param {object} params
 * @param {string|null} params.userId - id of the user performing the action (null if unauthenticated, e.g. failed login)
 * @param {string|null} params.userEmail - email at time of action (kept even if the user is later deleted)
 * @param {string} params.action - short machine-readable action name, e.g. 'login', 'login_failed', 'product_create'
 * @param {string} [params.resource] - resource type affected, e.g. 'product', 'news_post', 'user'
 * @param {string} [params.resourceId] - id of the affected row
 * @param {object} [params.details] - extra non-sensitive context
 * @param {import('express').Request} [params.req] - the request, to capture IP + user agent
 */
async function logAudit({
  userId = null,
  userEmail = null,
  action,
  resource = null,
  resourceId = null,
  details = {},
  req = null,
}) {
  try {
    const ip = req
      ? req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress
      : null;
    const userAgent = req ? req.headers["user-agent"] : null;

    await db.query(
      `INSERT INTO audit_logs (user_id, user_email, action, resource, resource_id, details, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        JSON.stringify(details),
        ip,
        userAgent,
      ],
    );
  } catch (err) {
    // Audit logging must never break the actual request — log the failure and move on.
    console.error("Failed to write audit log:", err.message);
  }
}

module.exports = { logAudit };
