"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkReadButton({ submissionId }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleMarkRead() {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/contact/${submissionId}/read`, {
        method: "PATCH",
      });
      if (!res.ok) {
        alert("Failed to mark as read.");
        setIsUpdating(false);
        return;
      }
      router.refresh();
    } catch (err) {
      alert("Network error.");
      setIsUpdating(false);
    }
  }

  return (
    <button
      onClick={handleMarkRead}
      disabled={isUpdating}
      className="text-primary text-sm font-semibold hover:underline disabled:opacity-50"
    >
      {isUpdating ? "Marking..." : "Mark as Read"}
    </button>
  );
}
