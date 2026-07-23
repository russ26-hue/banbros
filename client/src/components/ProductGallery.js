"use client";

import { useState } from "react";
import ImageMagnifier from "./ImageMagnifier";

export default function ProductGallery({ mainImageUrl, gallery, title }) {
  const allImages = [
    ...(mainImageUrl ? [mainImageUrl] : []),
    ...(Array.isArray(gallery) ? gallery : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="aspect-[4/3] bg-surface rounded-xl flex items-center justify-center text-text-muted text-sm">
        No image
      </div>
    );
  }

  const activeImage = allImages[activeIndex];

  function goToPrev() {
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }

  function goToNext() {
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  }

  return (
    <div>
      <div className="relative aspect-[4/3] bg-surface rounded-xl overflow-hidden">
        <ImageMagnifier src={activeImage} alt={title} />

        {allImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-navy rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors"
            >
              ‹
            </button>
            <button
              onClick={goToNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-navy rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors"
            >
              ›
            </button>
          </>
        )}
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {allImages.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
