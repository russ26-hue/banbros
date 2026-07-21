const express = require("express");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { deepSanitizeContent } = require("../utils/sanitize");
const { logAudit } = require("../utils/auditLog");

const router = express.Router();

// GET /api/cms/:page - returns all sections for a page as { sectionKey: content }
router.get("/:page", async (req, res) => {
  const result = await db.query(
    "SELECT section_key, content, updated_at FROM cms_sections WHERE page = $1",
    [req.params.page],
  );
  const sections = {};
  result.rows.forEach((row) => {
    sections[row.section_key] = row.content;
  });
  res.json({ page: req.params.page, sections });
});

// PUT /api/cms/:page/:sectionKey - upsert one section's content (Admin+)
router.put(
  "/:page/:sectionKey",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const { page, sectionKey } = req.params;
    const rawContent = req.body;

    if (!rawContent || typeof rawContent !== "object") {
      return res.status(400).json({
        error: "Request body must be a JSON object of content fields.",
      });
    }

    const content = deepSanitizeContent(rawContent);

    const result = await db.query(
      `INSERT INTO cms_sections (page, section_key, content, updated_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (page, section_key)
     DO UPDATE SET content = $3, updated_by = $4, updated_at = now()
     RETURNING page, section_key, content, updated_at`,
      [page, sectionKey, JSON.stringify(content), req.user.id],
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: "cms_content_update",
      resource: "cms_section",
      resourceId: `${page}/${sectionKey}`,
      details: { page, sectionKey },
      req,
    });

    res.json({ section: result.rows[0] });
  },
);

module.exports = router;
