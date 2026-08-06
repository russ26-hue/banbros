"use client";

import { useRef, useState } from "react";

export default function FileUploadField({
  accept,
  multiple = false,
  onChange,
  hint,
  buttonText = "Click to upload",
  required = false,
}) {
  const inputRef = useRef(null);
  const [fileNames, setFileNames] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    setFileNames(Array.from(fileList).map((f) => f.name));
    onChange(fileList);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary hover:bg-surface"
        }`}
      >
        <svg
          className="w-8 h-8 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          />
        </svg>

        <p className="text-sm font-medium text-navy">
          {buttonText}
          <span className="text-text-muted font-normal"> or drag and drop</span>
        </p>

        {hint && <p className="text-xs text-text-muted">{hint}</p>}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          required={required && fileNames.length === 0}
          onChange={(e) => {
            handleFiles(e.target.files);
            // Clearing the value lets the same file be re-selected later,
            // which the browser would otherwise ignore as "no change".
            if (multiple) e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {fileNames.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileNames.map((name, i) => (
            <p key={i} className="text-xs text-navy flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-green-600 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
