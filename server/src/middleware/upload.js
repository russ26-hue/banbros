const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { fromFile } = require("file-type");

const UPLOAD_ROOT = path.join(
  __dirname,
  "..",
  "..",
  process.env.UPLOAD_DIR || "uploads",
);
const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 5);
const MAX_DOCUMENT_MB = Number(process.env.MAX_DOCUMENT_UPLOAD_MB || 10);

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_DOCUMENT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function storageFor(subfolder) {
  const dir = path.join(UPLOAD_ROOT, subfolder);
  fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = crypto.randomBytes(8).toString("hex");
      cb(null, `${Date.now()}-${unique}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  // First-pass check based on the client-reported MIME type. This is easy to
  // spoof, so it's just a quick reject for obviously wrong uploads — the real
  // check happens after the file is written to disk, in verifyImageContent below.
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed."));
  }
  return cb(null, true);
}

function documentFileFilter(req, file, cb) {
  // Same reasoning as fileFilter above — quick reject on obviously wrong
  // uploads, real verification happens in verifyDocumentContent after write.
  if (!ALLOWED_DOCUMENT_MIME.has(file.mimetype)) {
    return cb(new Error("Only PDF, DOC, or DOCX files are allowed."));
  }
  return cb(null, true);
}

/**
 * Returns a configured multer instance that saves into
 * uploads/<subfolder>/ (e.g. "products", "news").
 */
function makeUploader(subfolder) {
  return multer({
    storage: storageFor(subfolder),
    fileFilter,
    limits: { fileSize: MAX_MB * 1024 * 1024 },
  });
}

/**
 * Same as makeUploader, but accepts PDF/DOC/DOCX instead of images.
 * Used for resumes and similar document uploads.
 */
function makeDocumentUploader(subfolder) {
  return multer({
    storage: storageFor(subfolder),
    fileFilter: documentFileFilter,
    limits: { fileSize: MAX_DOCUMENT_MB * 1024 * 1024 },
  });
}

/**
 * Middleware to run AFTER multer's .single(fieldName) middleware.
 * Reads the actual bytes of the uploaded file and confirms its real
 * file signature matches an allowed image type — not just the
 * filename extension or the client-supplied Content-Type header,
 * both of which can be spoofed. Deletes the file and rejects the
 * request if the content doesn't match.
 */
function verifyImageContent(req, res, next) {
  if (!req.file) return next(); // no file uploaded on this request, nothing to check

  fromFile(req.file.path)
    .then((detected) => {
      if (!detected || !ALLOWED_MIME.has(detected.mime)) {
        fs.unlink(req.file.path, () => {});
        return res
          .status(400)
          .json({ error: "The uploaded file is not a valid image." });
      }
      return next();
    })
    .catch((err) => {
      fs.unlink(req.file.path, () => {});
      console.error("Image verification failed:", err.message);
      return res
        .status(400)
        .json({ error: "Could not verify the uploaded file." });
    });
}

/**
 * Same idea as verifyImageContent, but for documents. Note: legacy .doc
 * files (application/msword) are an old binary format that file-type
 * often can't reliably fingerprint, so we only hard-verify PDF/DOCX by
 * content signature and just trust the MIME-based fileFilter check for
 * .doc uploads specifically.
 */
function verifyDocumentContent(req, res, next) {
  if (!req.file) return next();

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext === ".doc") return next(); // see note above

  fromFile(req.file.path)
    .then((detected) => {
      if (!detected || !ALLOWED_DOCUMENT_MIME.has(detected.mime)) {
        fs.unlink(req.file.path, () => {});
        return res
          .status(400)
          .json({ error: "The uploaded file is not a valid document." });
      }
      return next();
    })
    .catch((err) => {
      fs.unlink(req.file.path, () => {});
      console.error("Document verification failed:", err.message);
      return res
        .status(400)
        .json({ error: "Could not verify the uploaded file." });
    });
}

/**
 * Same idea as verifyImageContent, but for routes using upload.fields()
 * instead of upload.single() — where multiple files may arrive across
 * multiple named fields (e.g. one "image" plus several "gallery" files).
 * req.files is an object of { fieldName: [file, ...] } in this case.
 * If ANY file fails verification, the whole request is rejected and every
 * uploaded file in the request is deleted, to avoid orphaned partial uploads.
 */
function verifyImageContentFields(req, res, next) {
  if (!req.files) return next();

  const allFiles = Object.values(req.files).flat();
  if (allFiles.length === 0) return next();

  Promise.all(
    allFiles.map((file) =>
      fromFile(file.path).then((detected) => ({ file, detected })),
    ),
  )
    .then((results) => {
      const invalid = results.some(
        ({ detected }) => !detected || !ALLOWED_MIME.has(detected.mime),
      );
      if (invalid) {
        allFiles.forEach((f) => fs.unlink(f.path, () => {}));
        return res
          .status(400)
          .json({ error: "One or more uploaded files are not valid images." });
      }
      return next();
    })
    .catch((err) => {
      allFiles.forEach((f) => fs.unlink(f.path, () => {}));
      console.error("Image verification failed:", err.message);
      return res
        .status(400)
        .json({ error: "Could not verify the uploaded files." });
    });
}

module.exports = {
  makeUploader,
  makeDocumentUploader,
  verifyImageContent,
  verifyImageContentFields,
  verifyDocumentContent,
  UPLOAD_ROOT,
};
