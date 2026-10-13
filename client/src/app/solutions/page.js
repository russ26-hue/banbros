import Link from "next/link";
import SolutionsFilterBar from "@/components/SolutionsFilterBar";

async function getSolutions({ brand, category, search }) {
  const params = new URLSearchParams();
  if (brand) params.set("brand", brand);
  if (category) params.set("category", category);
  if (search) params.set("search", search);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solutions?${params.toString()}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch solutions");
  const data = await res.json();
  return data.solutions || [];
}

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solutions/categories`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories || [];
}

async function getBrands() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solutions/brands`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.brands || [];
}

export const metadata = {
  title: "Solutions | Banbros",
  description:
    "Technology solutions and services offered by Banbros Commercial Incorporated.",
};

export default async function SolutionsPage({ searchParams }) {
  const params = await searchParams;
  const brand = params?.brand || "";
  const category = params?.category || "";
  const search = params?.search || "";

  const [solutions, categories, brands] = await Promise.all([
    getSolutions({ brand, category, search }),
    getCategories(),
    getBrands(),
  ]);

  // Mirrors the reference design's "Brand / Category" heading when a single
  // filter is active, so visitors can see what they are looking at.
  const activeBrand = brands.find((b) => b.slug === brand);
  const activeCategory = categories.find((c) => c.slug === category);

  const headingParts = [activeBrand?.name, activeCategory?.name].filter(
    Boolean,
  );
  const heading =
    headingParts.length > 0 ? headingParts.join(" / ") : "Solutions";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-10">
        {heading}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <SolutionsFilterBar categories={categories} brands={brands} />

        <div className="flex-1">
          {solutions.length === 0 ? (
            <p className="text-center text-text-muted py-16">
              No solutions match these filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {solutions.map((solution) => (
                <Link
                  key={solution.id}
                  href={`/solutions/${solution.slug}`}
                  className="group block rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                  style={{ backgroundColor: solution.tile_color }}
                >
                  <div className="flex items-center justify-center text-center p-8 min-h-[220px]">
                    <div>
                      <h2 className="text-white text-xl font-bold leading-snug">
                        {solution.title}
                      </h2>
                      {solution.short_desc && (
                        <p className="text-white/80 text-sm mt-2">
                          {solution.short_desc}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
