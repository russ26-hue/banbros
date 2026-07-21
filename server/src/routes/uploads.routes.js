const express = require("express");
const db = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { makeUploader, verifyImageContent } = require("../middleware/upload");

const router = express.Router();
const upload = makeUploader("cms");

function toPublicUrl(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/cms/${filename}`;
}

// POST /api/uploads/image - generic image upload, returns a public URL.
// Used for content that doesn't map to a specific resource (e.g. hero slides),
// unlike product/brand images which are uploaded as part of creating that resource.
router.post(
  "/image",
  requireAuth,
  requireRole("admin", "super_admin"),
  upload.single("image"),
  verifyImageContent,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required." });
    }
    const url = toPublicUrl(req, req.file.filename);
    res.status(201).json({ url });
  },
);

module.exports = router;
