/**
 * Creates (or updates) the initial Super Admin account using
 * SUPER_ADMIN_* values from .env. Safe to re-run.
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

async function run() {
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env",
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await db.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  if (existing.rows.length > 0) {
    await db.query(
      `UPDATE users SET name = $1, password_hash = $2, role = 'super_admin', is_active = TRUE
       WHERE email = $3`,
      [name, passwordHash, email],
    );
    console.log(`Super admin updated: ${email}`);
  } else {
    await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'super_admin')`,
      [name, email, passwordHash],
    );
    console.log(`Super admin created: ${email}`);
  }

  console.log("Remember to change this password after first login.");
  await db.pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
