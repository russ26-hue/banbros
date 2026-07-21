const slugify = require("slugify");

/**
 * Turns "Mini Desktop PC – Pro Edition!" into "mini-desktop-pc-pro-edition"
 */
function toSlug(text) {
  return slugify(text, { lower: true, strict: true, trim: true });
}

/**
 * Ensures a slug is unique for a given table by appending -2, -3, etc.
 * table must be a trusted, hardcoded string (never user input) since
 * it's interpolated directly into the query.
 */
async function uniqueSlug(db, table, baseText, excludeId = null) {
  const base = toSlug(baseText);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const params = excludeId ? [candidate, excludeId] : [candidate];
    const whereExclude = excludeId ? "AND id <> $2" : "";
    const res = await db.query(
      `SELECT id FROM ${table} WHERE slug = $1 ${whereExclude} LIMIT 1`,
      params,
    );
    if (res.rows.length === 0) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

module.exports = { toSlug, uniqueSlug };
