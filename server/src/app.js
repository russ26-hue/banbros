const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const productsRoutes = require("./routes/products.routes");
const newsRoutes = require("./routes/news.routes");
const cmsRoutes = require("./routes/cms.routes");
const contactRoutes = require("./routes/contact.routes");
const brandsRoutes = require("./routes/brands.routes");
const uploadsRoutes = require("./routes/uploads.routes");
const careersRoutes = require("./routes/careers.routes");

const app = express();

// -------------------- HTTPS enforcement (production only) --------------------
// Only active in production, and only actually redirects once the app is behind
// a reverse proxy that sets X-Forwarded-Proto (e.g. Nginx, most hosting platforms).
// Without a working proxy in front of it, this does nothing on plain localhost dev.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust the first proxy hop for req.secure / X-Forwarded-* headers
  app.use((req, res, next) => {
    if (!req.secure && req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
    }
    next();
  });
}

// -------------------- Core middleware --------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow images to be loaded cross-origin by the Next.js frontend
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// Helmet no longer ships a Permissions-Policy option, so we set it directly.
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );
  next();
});
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, server-to-server calls)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// -------------------- Static file serving for uploaded images --------------------
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads"),
  ),
);

// -------------------- Health check --------------------
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// -------------------- Routes --------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/careers", careersRoutes);

// -------------------- 404 --------------------
app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

// -------------------- Central error handler --------------------
app.use((err, req, res, next) => {
  // Log a redacted version — never let raw error objects (which can include
  // connection strings, tokens, or file paths) hit stdout/stderr as-is.
  console.error({
    message: err.message,
    status: err.status || 500,
    path: req.originalUrl,
    method: req.method,
    // Stack traces are useful for debugging but can reference internal paths/config;
    // keep them in development only.
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  if (err.message && err.message.includes("Only JPG, PNG, WEBP")) {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File is too large." });
  }

  // In production, never leak internal error messages to the client — only our
  // own intentional, user-facing messages (like the ones above) get through.
  const isProd = process.env.NODE_ENV === "production";
  const clientMessage =
    isProd && !err.status
      ? "Internal server error."
      : err.message || "Internal server error.";

  res.status(err.status || 500).json({ error: clientMessage });
});

module.exports = app;
