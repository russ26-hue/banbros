"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// Turn "product_create" into "Product create" for display.
function humanise(value) {
  return value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export default function AuditLogFilterBar({ actions, resources }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userEmail, setUserEmail] = useState(
    searchParams.get("userEmail") || "",
  );

  const currentAction = searchParams.get("action") || "";
  const currentResource = searchParams.get("resource") || "";
  const currentFrom = searchParams.get("dateFrom") || "";
  const currentTo = searchParams.get("dateTo") || "";

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    updateParams({ userEmail });
  }

  function clearAll() {
    setUserEmail("");
    router.push(pathname);
  }

  const hasFilters =
    userEmail || currentAction || currentResource || currentFrom || currentTo;

  return (
    <div className="bg-white border border-border rounded-lg p-3 mb-4 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <form onSubmit={handleEmailSubmit} className="flex gap-2 flex-1">
          <input
            type="text"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Filter by user email..."
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <select
            value={currentAction}
            onChange={(e) => updateParams({ action: e.target.value })}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {humanise(a)}
              </option>
            ))}
          </select>

          <select
            value={currentResource}
            onChange={(e) => updateParams({ resource: e.target.value })}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All resources</option>
            {resources.map((r) => (
              <option key={r} value={r}>
                {humanise(r)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-text-muted">From</label>
        <input
          type="date"
          value={currentFrom}
          onChange={(e) => updateParams({ dateFrom: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <label className="text-sm text-text-muted">To</label>
        <input
          type="date"
          value={currentTo}
          onChange={(e) => updateParams({ dateTo: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-text-muted hover:text-navy px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
