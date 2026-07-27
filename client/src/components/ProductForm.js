"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductForm({
  mode,
  categories,
  brands,
  initialData,
  productId,
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [shortDesc, setShortDesc] = useState(initialData?.short_desc || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [brandId, setBrandId] = useState(initialData?.brand_id || "");
  const [isFeatured, setIsFeatured] = useState(
    initialData?.is_featured || false,
  );
  const [isPublished, setIsPublished] = useState(
    initialData?.is_published !== undefined ? initialData.is_published : true,
  );
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl] = useState(initialData?.image_url || "");

  const [keptGalleryUrls, setKeptGalleryUrls] = useState(
    Array.isArray(initialData?.gallery) ? initialData.gallery : [],
  );
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);

  const initialSpecs = initialData?.specs
    ? Object.entries(initialData.specs).map(([key, value]) => ({ key, value }))
    : [];
  const [specs, setSpecs] = useState(
    initialSpecs.length > 0 ? initialSpecs : [{ key: "", value: "" }],
  );

  const [featuresText, setFeaturesText] = useState(
    Array.isArray(initialData?.features) ? initialData.features.join("\n") : "",
  );

  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [errorMessage, setErrorMessage] = useState("");

  function updateSpecRow(index, field, value) {
    setSpecs((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function addSpecRow() {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeSpecRow(index) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingGalleryPhoto(url) {
    setKeptGalleryUrls((prev) => prev.filter((u) => u !== url));
  }

  function addNewGalleryFiles(fileList) {
    setNewGalleryFiles((prev) => [...prev, ...Array.from(fileList)]);
  }

  function removeNewGalleryFile(index) {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const specsObject = {};
    specs.forEach(({ key, value }) => {
      if (key.trim()) specsObject[key.trim()] = value;
    });

    const featuresArray = featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("shortDesc", shortDesc);
    formData.append("description", description);
    if (categoryId) formData.append("categoryId", categoryId);
    if (brandId) formData.append("brandId", brandId);
    formData.append("isFeatured", isFeatured ? "true" : "false");
    formData.append("isPublished", isPublished ? "true" : "false");
    formData.append("specs", JSON.stringify(specsObject));
    formData.append("features", JSON.stringify(featuresArray));
    if (imageFile) formData.append("image", imageFile);
    formData.append("existingGallery", JSON.stringify(keptGalleryUrls));
    newGalleryFiles.forEach((file) => formData.append("gallery", file));

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${productId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || `Failed to save product (${res.status})`);
        setStatus("error");
        return;
      }

      router.push("/admin/products");
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
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Short Description
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
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Brand
        </label>
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="">No brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-muted mt-1">
          Lets visitors browse this brand's products by clicking its logo on the
          homepage.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Main Image
        </label>
        {existingImageUrl && !imageFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={existingImageUrl}
            alt="Current"
            className="w-24 h-24 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-2">
          Gallery{" "}
          <span className="text-text-muted font-normal">
            (additional photos)
          </span>
        </label>

        {(keptGalleryUrls.length > 0 || newGalleryFiles.length > 0) && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {keptGalleryUrls.map((url) => (
              <div key={url} className="relative aspect-square group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Gallery photo"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeExistingGalleryPhoto(url)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs font-semibold w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            {newGalleryFiles.map((file, i) => (
              <div key={i} className="relative aspect-square group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt="New gallery photo"
                  className="w-full h-full object-cover rounded-lg"
                />
                <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  New
                </span>
                <button
                  type="button"
                  onClick={() => removeNewGalleryFile(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs font-semibold w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            addNewGalleryFiles(e.target.files);
            e.target.value = "";
          }}
          className="w-full text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-2">
          Specifications
        </label>
        <div className="space-y-2">
          {specs.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Key (e.g. CPU)"
                value={row.key}
                onChange={(e) => updateSpecRow(i, "key", e.target.value)}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Value (e.g. Intel i5)"
                value={row.value}
                onChange={(e) => updateSpecRow(i, "value", e.target.value)}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => removeSpecRow(i)}
                className="text-red-600 text-sm font-semibold px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSpecRow}
          className="mt-2 text-sm text-primary font-semibold hover:underline"
        >
          + Add Spec
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Features{" "}
          <span className="text-text-muted font-normal">(one per line)</span>
        </label>
        <textarea
          rows={4}
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          placeholder={"16GB RAM\n512GB SSD\nBacklit keyboard"}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published
        </label>
      </div>

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
            ? "Create Product"
            : "Save Changes"}
      </button>
    </form>
  );
}
