"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FileUploadField from "@/components/FileUploadField";

export default function CareersCollageAdminPage() {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | saving | error | success
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cms/careers`,
          {
            cache: "no-store",
          },
        );
        const data = await res.json();
        const existingImages = data.sections?.collage?.images;
        setImages(Array.isArray(existingImages) ? existingImages : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAddImage(file) {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upload failed.");
        return;
      }

      setImages((prev) => [...prev, data.url]);
    } catch (err) {
      alert("Network error during upload.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/cms/careers/collage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to save.");
        setStatus("error");
        return;
      }

      setStatus("success");
      router.refresh();
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-2">
        Careers Page Collage
      </h1>
      <p className="text-text-muted mb-6">
        Photos shown at the top of the public Careers page.
      </p>

      <div className="max-w-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square bg-surface rounded-lg overflow-hidden group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Collage ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs font-semibold w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-navy mb-1">
            Add Photo
          </label>
          <FileUploadField
            accept="image/*"
            hint="Square photos work best"
            buttonText="Add a collage photo"
            onChange={(files) => handleAddImage(files?.[0])}
          />
          {uploading && (
            <p className="text-xs text-text-muted mt-1">Uploading...</p>
          )}
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-green-600 mb-3">Saved successfully.</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "saving" ? "Saving..." : "Save Collage"}
        </button>
      </div>
    </div>
  );
}
