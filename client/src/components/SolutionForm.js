"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import FileUploadField from "./FileUploadField";

// A small palette so tiles stay visually consistent, with a custom picker
// for anything outside it.
const PRESET_COLORS = [
  { label: "Navy", value: "#0F1B2D" },
  { label: "Deep red", value: "#7F1D1D" },
  { label: "Slate", value: "#334155" },
  { label: "Grey", value: "#9CA3AF" },
  { label: "Teal", value: "#0F766E" },
  { label: "Cyan", value: "#0EA5E9" },
];

export default function SolutionForm({
  mode,
  brands,
  categories,
  initialData,
  solutionId,
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [brandId, setBrandId] = useState(initialData?.brand_id || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [shortDesc, setShortDesc] = useState(initialData?.short_desc || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [tileColor, setTileColor] = useState(
    initialData?.tile_color || "#0F1B2D",
  );
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [isPublished, setIsPublished] = useState(
    initialData?.is_published !== undefined ? initialData.is_published : true,
  );
  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdfUrl] = useState(initialData?.pdf_url || "");

  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("title", title);
    if (brandId) formData.append("brandId", brandId);
    if (categoryId) formData.append("categoryId", categoryId);
    formData.append("shortDesc", shortDesc);
    formData.append("description", description);
    formData.append("tileColor", tileColor);
    formData.append("sortOrder", String(sortOrder));
    formData.append("isPublished", isPublished ? "true" : "false");
    if (pdfFile) formData.append("pdf", pdfFile);

    const url =
      mode === "create"
        ? "/api/admin/solutions"
        : `/api/admin/solutions/${solutionId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error || `Failed to save solution (${res.status})`,
        );
        setStatus("error");
        return;
      }

      router.push("/admin/solutions");
      router.refresh();
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cyber Security Monitoring Solution (VCS-Cym)"
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Brand
          </label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">No brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Short description{" "}
          <span className="text-text-muted font-normal">
            (shown under the title)
          </span>
        </label>
        <input
          type="text"
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Description
        </label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          rows={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-2">
          Tile colour
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setTileColor(preset.value)}
              title={preset.label}
              aria-label={preset.label}
              className={`w-9 h-9 rounded border-2 transition-all ${
                tileColor.toLowerCase() === preset.value.toLowerCase()
                  ? "border-primary scale-110"
                  : "border-border"
              }`}
              style={{ backgroundColor: preset.value }}
            />
          ))}

          <input
            type="color"
            value={tileColor}
            onChange={(e) => setTileColor(e.target.value)}
            title="Custom colour"
            className="w-9 h-9 rounded border border-border cursor-pointer bg-white"
          />
        </div>

        <div
          className="mt-3 rounded-lg flex items-center justify-center text-white font-semibold text-center px-4"
          style={{ backgroundColor: tileColor, minHeight: "90px" }}
        >
          {title || "Tile preview"}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Service PDF
        </label>
        {existingPdfUrl && !pdfFile && (
          <p className="text-xs text-text-muted mb-2">
            Current file:{" "}
            <a
              href={existingPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              view
            </a>
            . Uploading a new file replaces it.
          </p>
        )}
        <FileUploadField
          accept=".pdf,.doc,.docx"
          hint="PDF, DOC, or DOCX"
          buttonText="Upload service PDF"
          onChange={(files) => setPdfFile(files?.[0] || null)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Sort order
        </label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-text-muted mt-1">
          Lower numbers appear first.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        Published
      </label>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting"
          ? "Saving..."
          : mode === "create"
            ? "Create Solution"
            : "Save Changes"}
      </button>
    </form>
  );
}
