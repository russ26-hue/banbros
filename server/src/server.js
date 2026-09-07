require("dotenv").config();
const app = require("./app");
const { cleanupOldApplications } = require("./jobs/cleanupApplications");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

// -------------------- Scheduled data retention cleanup --------------------
// The privacy policy commits to deleting job applications after the retention
// period, so this has to run without anyone remembering to trigger it.
//
// This runs inside the web server rather than as a separate scheduled service,
// which is adequate here: the job is idempotent, and running a few hours late
// (or twice) has no adverse effect. It only runs while the server is up, which
// for an always-on service means daily in practice.
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function runCleanupSafely() {
  cleanupOldApplications().catch((err) => {
    // A failure here must never bring down the API.
    console.error("Scheduled retention cleanup failed:", err.message);
  });
}

// Wait a minute after startup before the first run, so a restart loop cannot
// trigger repeated cleanups and so it does not compete with startup traffic.
setTimeout(runCleanupSafely, 60 * 1000);
setInterval(runCleanupSafely, CLEANUP_INTERVAL_MS);
