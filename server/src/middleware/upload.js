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

const sharp = require("sharp");

const MAX_IMAGE_WIDTH = Number(process.env.MAX_IMAGE_WIDTH || 1920);
const JPEG_QUALITY = Number(process.env.JPEG_QUALITY || 80);

/**
 * Resizes and re-compresses one uploaded image in place.
 *
 * Photographic PNGs are converted to JPEG, because PNG is lossless and cannot
 * compress photographs effectively — a 3 MB photo stays roughly 3 MB as PNG
 * but becomes a few hundred KB as JPEG. PNGs that contain transparency are
 * left as PNG, since converting those would replace the transparent areas
 * with a solid background (bad for logos).
 *
 * When the format changes, the file is renamed and `file.filename` is updated
 * in place, because the routes build the public URL from that value.
 *
 * Animated GIFs are skipped entirely: resizing them here would flatten them
 * to a single frame.
 */
async function compressOneImage(file) {
  const filePath = file.path;
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".gif") return; // preserve animation

  const metadata = await sharp(filePath).metadata();

  // hasAlpha tells us the image *can* carry transparency. That is a
  // conservative check — some opaque PNGs also report true — but erring
  // toward keeping PNG is safer than flattening a logo onto white.
  const keepAsPng = ext === ".png" && metadata.hasAlpha;

  const targetExt = keepAsPng ? ".png" : ext === ".webp" ? ".webp" : ".jpg";
  const changingFormat = targetExt !== ext;

  const tempPath = `${filePath}.tmp${targetExt}`;

  let pipeline = sharp(filePath).rotate(); // honour EXIF orientation

  if (metadata.width && metadata.width > MAX_IMAGE_WIDTH) {
    pipeline = pipeline.resize({
      width: MAX_IMAGE_WIDTH,
      withoutEnlargement: true,
    });
  }

  if (targetExt === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else if (targetExt === ".webp") {
    pipeline = pipeline.webp({ quality: JPEG_QUALITY });
  } else {
    // Flatten onto white first: JPEG has no alpha channel, and without this
    // any transparent pixels would render as black.
    pipeline = pipeline
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  }

  await pipeline.toFile(tempPath);

  if (changingFormat) {
    const newPath = filePath.replace(new RegExp(`${ext}$`), targetExt);
    fs.renameSync(tempPath, newPath);
    fs.unlinkSync(filePath); // remove the original, now-unused file

    // The routes derive the public URL from these, so they must be updated.
    file.path = newPath;
    file.filename = path.basename(newPath);
  } else {
    fs.renameSync(tempPath, filePath);
  }
}

/**
 * Middleware: compresses every uploaded image on the request, whether it came
 * from upload.single() (req.file) or upload.fields() (req.files).
 *
 * Runs AFTER the content-verification middleware, so only files already
 * confirmed to be genuine images reach this point.
 *
 * Compression failure is deliberately non-fatal: if sharp cannot process a
 * file, the original upload is kept as-is rather than rejecting the request.
 * A slightly oversized image is a much better outcome than a failed save.
 */
async function compressUploadedImages(req, res, next) {
  const files = [];
  if (req.file) files.push(req.file);
  if (req.files) files.push(...Object.values(req.files).flat());

  if (files.length === 0) return next();

  try {
    await Promise.all(
      files.map((file) =>
        compressOneImage(file).catch((err) => {
          console.error(
            `Image compression skipped for ${file.filename}:`,
            err.message,
          );
        }),
      ),
    );
  } catch (err) {
    console.error("Unexpected error during image compression:", err.message);
  }

  return next();
}

module.exports = {
  makeUploader,
  makeDocumentUploader,
  verifyImageContent,
  verifyImageContentFields,
  verifyDocumentContent,
  compressUploadedImages,
  UPLOAD_ROOT,
};
