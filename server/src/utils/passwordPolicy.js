/**
 * Shared password complexity rule, used anywhere a user sets or
 * changes a password (Admin creation, password change, etc).
 * Requires: min 8 chars, at least one uppercase, one lowercase,
 * one number, and one special character.
 */
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function isStrongPassword(password) {
  return typeof password === "string" && STRONG_PASSWORD_REGEX.test(password);
}

const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";

module.exports = { isStrongPassword, PASSWORD_POLICY_MESSAGE };
