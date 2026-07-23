"use client";

import { useState, useRef } from "react";

export default function ImageMagnifier({ src, alt }) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const ZOOM = 2.5;
  const LENS_SIZE = 160;

  function handleMouseMove(e) {
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Ignore movement over the empty letterbox space around the image
    // (object-contain can leave gaps if the photo's aspect ratio doesn't
    // match the container), so the lens only activates over real pixels.
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      setShowMagnifier(false);
      return;
    }
    setShowMagnifier(true);

    setCursorPos({ x, y });
    setBgPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  }

  return (
    <div className="relative w-full h-full cursor-crosshair">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
      />

      {showMagnifier && imgRef.current && (
        <div
          className="hidden sm:block absolute pointer-events-none rounded-full border-2 border-white shadow-lg z-10"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: cursorPos.x - LENS_SIZE / 2,
            top: cursorPos.y - LENS_SIZE / 2,
            backgroundImage: `url(${src})`,
            backgroundSize: `${imgRef.current.getBoundingClientRect().width * ZOOM}px ${
              imgRef.current.getBoundingClientRect().height * ZOOM
            }px`,
            backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  );
}
