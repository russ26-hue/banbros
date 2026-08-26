const express = require("express");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Every route here requires a logged-in Super Admin.
router.use(requireAuth, requireRole("super_admin"));

// GET /api/audit-logs - paginated, filterable activity log
router.get("/", async (req, res) => {
  const {
    userEmail,
    action,
    resource,
    dateFrom,
    dateTo,
    page = 1,
    limit = 50,
  } = req.query;

  const conditions = [];
  const params = [];

  if (userEmail) {
    params.push(`%${userEmail}%`);
    conditions.push(`user_email ILIKE $${params.length}`);
  }
  if (action) {
    params.push(action);
    conditions.push(`action = $${params.length}`);
  }
  if (resource) {
    params.push(resource);
    conditions.push(`resource = $${params.length}`);
  }
  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (dateTo) {
    // Push the end date to the end of that day so a single-day range
    // includes everything that happened on it.
    params.push(dateTo);
    conditions.push(
      `created_at < ($${params.length}::date + INTERVAL '1 day')`,
    );
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const safeLimit = Math.min(Number(limit) || 50, 200);
  const offset = (Math.max(1, Number(page)) - 1) * safeLimit;

  params.push(safeLimit, offset);

  const result = await db.query(
    `SELECT id, user_id, user_email, action, resource, resource_id,
            details, ip_address, user_agent, created_at
     FROM audit_logs
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const countResult = await db.query(
    `SELECT COUNT(*) FROM audit_logs ${whereClause}`,
    params.slice(0, params.length - 2),
  );

  res.json({
    logs: result.rows,
    total: Number(countResult.rows[0].count),
    page: Number(page),
    limit: safeLimit,
  });
});

// GET /api/audit-logs/filters - distinct values, for populating the dropdowns
router.get("/filters", async (req, res) => {
  const actions = await db.query(
    "SELECT DISTINCT action FROM audit_logs ORDER BY action",
  );
  const resources = await db.query(
    "SELECT DISTINCT resource FROM audit_logs WHERE resource IS NOT NULL ORDER BY resource",
  );

  res.json({
    actions: actions.rows.map((r) => r.action),
    resources: resources.rows.map((r) => r.resource),
  });
});

module.exports = router;
