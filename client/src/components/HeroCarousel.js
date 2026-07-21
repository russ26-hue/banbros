"use client";

import { useState, useEffect, useCallback } from "react";

const AUTOPLAY_INTERVAL = 6000;

export default function HeroCarousel({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(goToNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [goToNext, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <section className="relative bg-white">
      <div className="relative aspect-[16/9] sm:aspect-[32/9] w-full">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              pointerEvents: i === activeIndex ? "auto" : "none",
            }}
          >
            {slide.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.imageUrl}
                alt={slide.title || ""}
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 82%, rgba(255,255,255,0.85) 100%)",
              }}
            />

            <div className="relative h-full flex items-center px-6 sm:px-10 lg:px-16">
              <div
                className="max-w-lg transition-all duration-700 ease-out"
                style={{
                  opacity: i === activeIndex ? 1 : 0,
                  transform:
                    i === activeIndex ? "translateY(0)" : "translateY(12px)",
                }}
              >
                {slide.eyebrow && (
                  <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-2">
                    {slide.eyebrow}
                  </p>
                )}
                {slide.title && (
                  <h1 className="text-navy text-xl sm:text-3xl font-bold mb-2">
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p className="text-navy/70 text-sm mb-5">{slide.subtitle}</p>
                )}
                {slide.buttonText && slide.buttonLink && (
                  <a
                    href={slide.buttonLink}
                    className="inline-block bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {slide.buttonText}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-navy/10 hover:bg-navy/20 text-navy rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ‹
            </button>
            <button
              onClick={goToNext}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-navy/10 hover:bg-navy/20 text-navy rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeIndex
                      ? "bg-primary"
                      : "bg-navy/20 hover:bg-navy/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
