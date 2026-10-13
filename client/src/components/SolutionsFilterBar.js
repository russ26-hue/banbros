"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SolutionsFilterBar({ categories, brands }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParams({ search });
  }

  function clearAll() {
    setSearch("");
    router.push(pathname);
  }

  const hasFilters = search || currentCategory || currentBrand;

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-navy">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-text-muted hover:text-navy"
          >
            Clear All
          </button>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      {categories.length > 0 && (
        <div className="bg-surface rounded-lg p-4 mb-4">
          <p className="font-semibold text-navy text-sm mb-3">Categories</p>
          <ul className="space-y-2">
            {categories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() =>
                      updateParams({ category: isActive ? "" : cat.slug })
                    }
                    className={`flex items-center gap-2 text-sm text-left transition-colors ${
                      isActive
                        ? "text-primary font-semibold"
                        : "text-text-muted hover:text-navy"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isActive ? "bg-primary" : "bg-primary/40"
                      }`}
                    />
                    {cat.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {brands.length > 0 && (
        <div className="bg-surface rounded-lg p-4">
          <p className="font-semibold text-navy text-sm mb-3">Brands</p>
          <ul className="space-y-2">
            {brands.map((brand) => {
              const isActive = currentBrand === brand.slug;
              return (
                <li key={brand.id}>
                  <button
                    onClick={() =>
                      updateParams({ brand: isActive ? "" : brand.slug })
                    }
                    className={`flex items-center gap-2 text-sm text-left transition-colors ${
                      isActive
                        ? "text-primary font-semibold"
                        : "text-text-muted hover:text-navy"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isActive ? "bg-primary" : "bg-primary/40"
                      }`}
                    />
                    {brand.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
