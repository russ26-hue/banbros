import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductsFilterBar from "@/components/ProductsFilterBar";

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/categories`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.categories;
}

async function getProducts({ category, brand, search, page }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (brand) params.set("brand", brand);
  if (search) params.set("search", search);
  params.set("page", page || "1");
  params.set("limit", "12");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const brand = params?.brand || "";
  const search = params?.search || "";
  const page = parseInt(params?.page || "1", 10);

  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({ category, brand, search, page }),
  ]);

  const { products, total, limit } = productsData;
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy">
          Our Products
        </h1>
        <p className="text-text-muted mt-2">Browse our full product catalog</p>
      </div>

      <ProductsFilterBar categories={categories} />

      {products.length === 0 ? (
        <p className="text-center text-text-muted py-16">
          {brand && !category && !search
            ? "No products from this brand yet. Check back soon!"
            : "No products found. Try adjusting your search or filters."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => {
              const linkParams = new URLSearchParams();
              if (category) linkParams.set("category", category);
              if (brand) linkParams.set("brand", brand);
              if (search) linkParams.set("search", search);
              if (pageNum > 1) linkParams.set("page", pageNum.toString());
              const href = `/products${linkParams.toString() ? `?${linkParams.toString()}` : ""}`;
              const isActive = pageNum === page;
              const activeClass = "bg-primary text-white";
              const inactiveClass =
                "bg-white border border-border text-navy hover:bg-surface";
              const linkClass =
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors " +
                (isActive ? activeClass : inactiveClass);

              return (
                <Link key={pageNum} href={href} className={linkClass}>
                  {pageNum}
                </Link>
              );
            },
          )}
        </div>
      )}
    </main>
  );
}
