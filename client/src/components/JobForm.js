"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";

export default function JobForm({ mode, initialData, jobId }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [qualifications, setQualifications] = useState(
    initialData?.qualifications || "",
  );
  const [isActive, setIsActive] = useState(
    initialData?.is_active !== undefined ? initialData.is_active : true,
  );

  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const payload = {
      title,
      description,
      qualifications,
      isActive: isActive ? "true" : "false",
    };

    const url =
      mode === "create" ? "/api/admin/careers" : `/api/admin/careers/${jobId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error || `Failed to save job posting (${res.status})`,
        );
        setStatus("error");
        return;
      }

      router.push("/admin/careers");
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
          Job Title
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
          Job Description
        </label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          rows={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Qualifications
        </label>
        <RichTextEditor
          value={qualifications}
          onChange={setQualifications}
          rows={8}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active (visible on the public Careers page)
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
            ? "Post Job"
            : "Save Changes"}
      </button>
    </form>
  );
}
