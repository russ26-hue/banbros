/**
 * Deletes job applications older than the retention period, along with the
 * resume files they reference.
 *
 * The privacy policy commits to retaining applications for one year, so this
 * must actually run — otherwise the stated retention period is inaccurate.
 *
 * Safe to run repeatedly: it only removes records that are already past the
 * cutoff, so running it twice in a day does nothing the second time.
 */
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const { UPLOAD_ROOT } = require("../middleware/upload");
const { logAudit } = require("../utils/auditLog");

const RETENTION_MONTHS = Number(process.env.APPLICATION_RETENTION_MONTHS || 12);

async function cleanupOldApplications() {
  // Select first so we know which files to remove — once the rows are gone,
  // the resume paths are gone with them.
  const expired = await db.query(
    `SELECT id, applicant_name, resume_url, submitted_at
     FROM job_applications
     WHERE submitted_at < now() - ($1 || ' months')::interval`,
    [RETENTION_MONTHS],
  );

  if (expired.rows.length === 0) {
    console.log(
      "Retention cleanup: no applications past the retention period.",
    );
    return { deleted: 0 };
  }

  let filesRemoved = 0;

  for (const row of expired.rows) {
    if (!row.resume_url) continue;

    // Stored URLs are absolute, so take just the filename from the end.
    const filename = row.resume_url.split("/").pop();

    // Reject anything that is not a plain filename, so a malformed value can
    // never cause a delete outside the resumes directory.
    if (!/^[A-Za-z0-9._-]+$/.test(filename)) continue;

    const filePath = path.join(UPLOAD_ROOT, "resumes", filename);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        filesRemoved += 1;
      }
    } catch (err) {
      // A file that cannot be removed should not stop the database cleanup —
      // log it and continue, so the records are still deleted on schedule.
      console.error(
        `Retention cleanup: could not delete ${filename}:`,
        err.message,
      );
    }
  }

  const ids = expired.rows.map((r) => r.id);
  await db.query("DELETE FROM job_applications WHERE id = ANY($1::uuid[])", [
    ids,
  ]);

  await logAudit({
    action: "retention_cleanup",
    resource: "job_application",
    details: {
      applicationsDeleted: expired.rows.length,
      filesRemoved,
      retentionMonths: RETENTION_MONTHS,
    },
  });

  console.log(
    `Retention cleanup: deleted ${expired.rows.length} application(s) and ${filesRemoved} resume file(s).`,
  );

  return { deleted: expired.rows.length, filesRemoved };
}

module.exports = { cleanupOldApplications };
