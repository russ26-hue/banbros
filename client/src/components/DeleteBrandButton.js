"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteBrandButton({ brandId, brandName }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${brandName}"? This can't be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${brandId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete brand.");
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
