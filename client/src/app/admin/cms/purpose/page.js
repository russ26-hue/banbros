"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PurposeAdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | saving | error | success
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/home`, {
          cache: "no-store",
        });
        const data = await res.json();
        const content = data.sections?.purpose_statement || {};
        setTitle(content.title || "");
        setBodyText(content.body || "");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setStatus("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/cms/home/purpose_statement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body: bodyText }),
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
      <h1 className="text-2xl font-bold text-navy mb-6">Purpose Statement</h1>

      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Body
          </label>
          <textarea
            rows={5}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-green-600">Saved successfully.</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "saving" ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
