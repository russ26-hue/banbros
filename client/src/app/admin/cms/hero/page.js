"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const emptySlide = {
  eyebrow: "",
  title: "",
  subtitle: "",
  buttonText: "",
  buttonLink: "",
  imageUrl: "",
};

export default function HeroSlidesAdminPage() {
  const router = useRouter();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | saving | error | success
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState(null);

  useEffect(() => {
    async function loadHero() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/home`, {
          cache: "no-store",
        });
        const data = await res.json();
        const existingSlides = data.sections?.hero?.slides;
        setSlides(
          Array.isArray(existingSlides) && existingSlides.length > 0
            ? existingSlides
            : [{ ...emptySlide }],
        );
      } catch (err) {
        setSlides([{ ...emptySlide }]);
      } finally {
        setLoading(false);
      }
    }
    loadHero();
  }, []);

  function updateSlide(index, field, value) {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide,
      ),
    );
  }

  function addSlide() {
    setSlides((prev) => [...prev, { ...emptySlide }]);
  }

  function removeSlide(index) {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSlide(index, direction) {
    setSlides((prev) => {
      const newSlides = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newSlides.length) return prev;
      [newSlides[index], newSlides[targetIndex]] = [
        newSlides[targetIndex],
        newSlides[index],
      ];
      return newSlides;
    });
  }

  async function handleImageUpload(index, file) {
    if (!file) return;
    setUploadingIndex(index);

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

      updateSlide(index, "imageUrl", data.url);
    } catch (err) {
      alert("Network error during upload.");
    } finally {
      setUploadingIndex(null);
    }
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/cms/home/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
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

  if (loading) {
    return <p className="text-text-muted">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">
        Hero Carousel Slides
      </h1>

      <div className="space-y-6 max-w-2xl">
        {slides.map((slide, i) => (
          <div key={i} className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-navy text-sm">Slide {i + 1}</p>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => moveSlide(i, -1)}
                  disabled={i === 0}
                  className="text-text-muted hover:text-navy disabled:opacity-30"
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(i, 1)}
                  disabled={i === slides.length - 1}
                  className="text-text-muted hover:text-navy disabled:opacity-30"
                >
                  ↓ Down
                </button>
                <button
                  type="button"
                  onClick={() => removeSlide(i)}
                  className="text-red-600 font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Eyebrow text (e.g. Trusted Technology Partner)"
                value={slide.eyebrow}
                onChange={(e) => updateSlide(i, "eyebrow", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Title"
                value={slide.title}
                onChange={(e) => updateSlide(i, "title", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={slide.subtitle}
                onChange={(e) => updateSlide(i, "subtitle", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Background Image
                </label>
                {slide.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.imageUrl}
                    alt="Slide preview"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(i, e.target.files?.[0])}
                  disabled={uploadingIndex === i}
                  className="w-full text-sm"
                />
                {uploadingIndex === i && (
                  <p className="text-xs text-text-muted mt-1">Uploading...</p>
                )}
                <input
                  type="url"
                  placeholder="Or paste an image URL directly"
                  value={slide.imageUrl}
                  onChange={(e) => updateSlide(i, "imageUrl", e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Button text (e.g. Explore Now)"
                  value={slide.buttonText}
                  onChange={(e) => updateSlide(i, "buttonText", e.target.value)}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Button link (e.g. /products)"
                  value={slide.buttonLink}
                  onChange={(e) => updateSlide(i, "buttonLink", e.target.value)}
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSlide}
          className="text-sm text-primary font-semibold hover:underline"
        >
          + Add Slide
        </button>

        {status === "error" && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-green-600">Saved successfully.</p>
        )}

        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving"}
            className="bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "saving" ? "Saving..." : "Save Slides"}
          </button>
        </div>
      </div>
    </div>
  );
}
