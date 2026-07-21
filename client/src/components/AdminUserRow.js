"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserRow({ user }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggleActive() {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.is_active }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update.");
        setIsUpdating(false);
        return;
      }
      router.refresh();
    } catch (err) {
      alert("Network error.");
      setIsUpdating(false);
    }
  }

  async function handleRevoke() {
    const confirmed = window.confirm(
      `Revoke access for "${user.name}"? They will no longer be able to log in.`,
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to revoke access.");
        setIsUpdating(false);
        return;
      }
      router.refresh();
    } catch (err) {
      alert("Network error.");
      setIsUpdating(false);
    }
  }

  const isSuperAdmin = user.role === "super_admin";

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 text-navy font-medium">{user.name}</td>
      <td className="px-4 py-3 text-text-muted">{user.email}</td>
      <td className="px-4 py-3 text-text-muted capitalize">
        {user.role.replace("_", " ")}
      </td>
      <td className="px-4 py-3">{user.is_active ? "✅" : "—"}</td>
      <td className="px-4 py-3 text-right space-x-3">
        {isSuperAdmin ? (
          <span className="text-text-muted text-xs">Protected account</span>
        ) : (
          <>
            <button
              onClick={handleToggleActive}
              disabled={isUpdating}
              className="text-primary font-semibold hover:underline disabled:opacity-50"
            >
              {user.is_active ? "Deactivate" : "Reactivate"}
            </button>
            <button
              onClick={handleRevoke}
              disabled={isUpdating}
              className="text-red-600 font-semibold hover:underline disabled:opacity-50"
            >
              Revoke
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
