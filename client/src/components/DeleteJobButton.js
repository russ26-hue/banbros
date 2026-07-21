"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteJobButton({ jobId, jobTitle }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${jobTitle}"? This will also delete all applications submitted for it. This can't be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/careers/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete job posting.");
        setIsDeleting(false);
        return;
      }
      router.refresh();
    } catch (err) {
      alert("Network error while deleting.");
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 font-semibold hover:underline disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
