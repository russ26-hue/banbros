"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function ProductsFilterBar({ categories }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const currentCategory = searchParams.get("category") || "";

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 whenever a filter changes
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParams({ search });
  }

  function handleCategoryChange(e) {
    updateParams({ category: e.target.value });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Search
        </button>
      </form>

      <select
        value={currentCategory}
        onChange={handleCategoryChange}
        className="border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
