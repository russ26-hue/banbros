const sanitizeHtml = require("sanitize-html");

/**
 * For fields that should NEVER contain any HTML at all
 * (titles, names, short descriptions, contact form fields, etc).
 * Strips all tags, keeps plain text only.
 */
function sanitizePlainText(input) {
  if (typeof input !== "string") return input;
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
}

/**
 * For rich-text fields where basic formatting is expected
 * (news article body, product long description).
 * Allows a safe subset of formatting tags, strips everything else
 * (scripts, event handlers, iframes, styles, etc).
 */
function sanitizeRichText(input) {
  if (typeof input !== "string") return input;
  return sanitizeHtml(input, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Force safe rel/target on links so sanitized content can't be used for tabnabbing
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  }).trim();
}

/**
 * Sanitizes every string value in a flat array (e.g. product "features").
 */
function sanitizeStringArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map((item) =>
    typeof item === "string" ? sanitizePlainText(item) : item,
  );
}

/**
 * Sanitizes every string value in a flat object (e.g. product "specs",
 * or a CMS section's content object).
 */
function sanitizeObjectStrings(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === "string" ? sanitizePlainText(value) : value;
  }
  return result;
}

/**
 * For fields that must be a safe, clickable URL (button links, website
 * links, image URLs). Only allows http(s) links or relative paths like
 * "/products" — rejects dangerous schemes like javascript: or data:,
 * which look like harmless text but execute code when clicked.
 * Returns an empty string if the input isn't a safe URL.
 */
function sanitizeUrl(input) {
  if (typeof input !== "string") return input;
  const trimmed = input.trim();
  if (trimmed === "") return "";

  // Relative paths (e.g. "/products") are always safe — they can't
  // specify a dangerous scheme.
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return trimmed;
    }
    return "";
  } catch (err) {
    // Not a valid absolute URL and not a relative path — reject it
    // rather than guessing what the admin meant.
    return "";
  }
}

/**
 * Recursively sanitizes every string found anywhere inside an object or
 * array, including nested arrays of objects (e.g. CMS hero content shaped
 * like { slides: [{ title, buttonLink, imageUrl }, ...] }).
 * Keys that look like they hold a URL (containing "url" or "link") are
 * run through sanitizeUrl instead of sanitizePlainText, so links can't be
 * hijacked with a javascript: scheme.
 */
function deepSanitizeContent(value, keyHint = "") {
  if (typeof value === "string") {
    const looksLikeUrl = /url|link/i.test(keyHint);
    return looksLikeUrl ? sanitizeUrl(value) : sanitizePlainText(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepSanitizeContent(item, keyHint));
  }
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = deepSanitizeContent(val, key);
    }
    return result;
  }
  return value; // numbers, booleans, null pass through unchanged
}

module.exports = {
  sanitizePlainText,
  sanitizeRichText,
  sanitizeStringArray,
  sanitizeObjectStrings,
  sanitizeUrl,
  deepSanitizeContent,
};
