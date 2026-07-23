"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BrandForm({ mode, initialData, brandId }) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [division, setDivision] = useState(
    initialData?.division || "corporate",
  );
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(
    initialData?.is_active !== undefined ? initialData.is_active : true,
  );
  const [logoFile, setLogoFile] = useState(null);
  const [existingLogoUrl] = useState(initialData?.logo_url || "");

  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("division", division);
    formData.append("websiteUrl", websiteUrl);
    formData.append("sortOrder", String(sortOrder));
    formData.append("isActive", isActive ? "true" : "false");
    if (logoFile) formData.append("logo", logoFile);

    if (mode === "create" && !logoFile) {
      setErrorMessage("Logo image is required.");
      setStatus("error");
      return;
    }

    const url =
      mode === "create" ? "/api/admin/brands" : `/api/admin/brands/${brandId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || `Failed to save brand (${res.status})`);
        setStatus("error");
        return;
      }

      router.push("/admin/brands");
      router.refresh();
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Division
        </label>
        <select
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="corporate">Corporate</option>
          <option value="commercial">Commercial</option>
        </select>
        <p className="text-xs text-text-muted mt-1">
          Controls which group this logo appears in on the homepage.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Website URL{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Sort Order
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

      <div>
        <label className="block text-sm font-medium text-navy mb-1">Logo</label>
        {existingLogoUrl && !logoFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={existingLogoUrl}
            alt="Current logo"
            className="w-24 h-24 object-contain bg-surface rounded p-2 mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
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
            ? "Add Brand"
            : "Save Changes"}
      </button>
    </form>
  );
}
