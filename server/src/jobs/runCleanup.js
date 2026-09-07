require("dotenv").config();
const db = require("../config/db");
const { cleanupOldApplications } = require("./cleanupApplications");

cleanupOldApplications()
  .then(() => db.pool.end())
  .catch((err) => {
    console.error("Retention cleanup failed:", err.message);
    db.pool.end();
    process.exitCode = 1;
  });
