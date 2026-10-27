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

// Builds a /products URL that keeps the current filters but changes the page.
function pageHref({ pageNum, category, brand, search }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (brand) params.set("brand", brand);
  if (search) params.set("search", search);
  if (pageNum > 1) params.set("page", String(pageNum));
  return `/products${params.toString() ? `?${params.toString()}` : ""}`;
}

function Pagination({ page, totalPages, category, brand, search }) {
  const linkFor = (pageNum) => pageHref({ pageNum, category, brand, search });

  const baseClass =
    "px-3 py-2 rounded-lg text-sm font-semibold transition-colors";
  const inactiveClass = `${baseClass} bg-white border border-border text-navy hover:bg-surface`;
  const activeClass = `${baseClass} bg-primary text-white`;

  // Show a window of pages around the current one. Listing every page is
  // unusable once there are dozens of them.
  const windowSize = 2;
  const pages = [];
  for (
    let i = Math.max(1, page - windowSize);
    i <= Math.min(totalPages, page + windowSize);
    i++
  ) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
      {page > 1 && (
        <Link href={linkFor(page - 1)} className={inactiveClass}>
          ‹ Previous
        </Link>
      )}

      {pages[0] > 1 && (
        <>
          <Link href={linkFor(1)} className={inactiveClass}>
            1
          </Link>
          {pages[0] > 2 && <span className="text-text-muted px-1">…</span>}
        </>
      )}

      {pages.map((pageNum) => (
        <Link
          key={pageNum}
          href={linkFor(pageNum)}
          className={pageNum === page ? activeClass : inactiveClass}
        >
          {pageNum}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-text-muted px-1">…</span>
          )}
          <Link href={linkFor(totalPages)} className={inactiveClass}>
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages && (
        <Link href={linkFor(page + 1)} className={inactiveClass}>
          Next ›
        </Link>
      )}
    </div>
  );
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
        <Pagination
          page={page}
          totalPages={totalPages}
          category={category}
          brand={brand}
          search={search}
        />
      )}
    </main>
  );
}
