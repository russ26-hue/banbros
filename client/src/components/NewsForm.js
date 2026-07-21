"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewsForm({ mode, initialData, postId }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [isPublished, setIsPublished] = useState(
    initialData?.is_published !== undefined ? initialData.is_published : true,
  );
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [existingCoverImageUrl] = useState(initialData?.cover_image_url || "");

  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("excerpt", excerpt);
    formData.append("body", body);
    formData.append("isPublished", isPublished ? "true" : "false");
    if (coverImageFile) formData.append("coverImage", coverImageFile);

    const url =
      mode === "create" ? "/api/admin/news" : `/api/admin/news/${postId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || `Failed to save article (${res.status})`);
        setStatus("error");
        return;
      }

      router.push("/admin/news");
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
          Excerpt
        </label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">Body</label>
        <textarea
          required
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Cover Image
        </label>
        {existingCoverImageUrl && !coverImageFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={existingCoverImageUrl}
            alt="Current cover"
            className="w-40 h-24 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
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
            ? "Publish Article"
            : "Save Changes"}
      </button>
    </form>
  );
}
