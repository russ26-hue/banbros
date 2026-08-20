import Link from "next/link";
import { cookies } from "next/headers";
import DeleteProductButton from "@/components/DeleteProductButton";
import AdminProductsFilterBar from "@/components/AdminProductsFilterBar";

async function getProducts({ search, category, brand, status, page }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (brand) params.set("brand", brand);
  if (status) params.set("status", status);
  params.set("page", page || "1");
  params.set("limit", "25");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/admin/all?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch products (${res.status}): ${errorBody}`);
  }
  return res.json();
}

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/categories`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories;
}

async function getBrands() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.brands;
}

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const category = params?.category || "";
  const brand = params?.brand || "";
  const status = params?.status || "";
  const page = parseInt(params?.page || "1", 10);

  const [productsData, categories, brands] = await Promise.all([
    getProducts({ search, category, brand, status, page }),
    getCategories(),
    getBrands(),
  ]);

  const { products, total, limit } = productsData;
  const totalPages = Math.ceil(total / limit);

  // Build a URL that preserves the current filters but changes the page.
  function pageHref(pageNum) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (category) p.set("category", category);
    if (brand) p.set("brand", brand);
    if (status) p.set("status", status);
    if (pageNum > 1) p.set("page", String(pageNum));
    return `/admin/products${p.toString() ? `?${p.toString()}` : ""}`;
  }

  // With thousands of products we cannot render every page number, so show
  // a window around the current page instead.
  const windowSize = 2;
  const pageNumbers = [];
  for (
    let i = Math.max(1, page - windowSize);
    i <= Math.min(totalPages, page + windowSize);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Products</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {total.toLocaleString()} product{total === 1 ? "" : "s"} total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Add Product
        </Link>
      </div>

      <AdminProductsFilterBar categories={categories} brands={brands} />

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy">Image</th>
              <th className="px-4 py-3 font-semibold text-navy">Title</th>
              <th className="px-4 py-3 font-semibold text-navy">Category</th>
              <th className="px-4 py-3 font-semibold text-navy">Brand</th>
              <th className="px-4 py-3 font-semibold text-navy">Featured</th>
              <th className="px-4 py-3 font-semibold text-navy">Published</th>
              <th className="px-4 py-3 font-semibold text-navy">Updated</th>
              <th className="px-4 py-3 font-semibold text-navy text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-12 h-12 object-contain bg-surface rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-surface rounded flex items-center justify-center text-xs text-text-muted">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-navy font-medium">
                  {product.title}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {product.category_name || "—"}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {product.brand_name || "—"}
                </td>
                <td className="px-4 py-3">
                  {product.is_featured ? "✅" : "—"}
                </td>
                <td className="px-4 py-3">
                  {product.is_published ? "✅" : "—"}
                </td>
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                  {new Date(product.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-primary font-semibold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton
                    productId={product.id}
                    productTitle={product.title}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="text-center text-text-muted py-10">
            No products match these filters.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-border text-navy hover:bg-surface"
            >
              ‹ Prev
            </Link>
          )}

          {pageNumbers[0] > 1 && (
            <>
              <Link
                href={pageHref(1)}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-border text-navy hover:bg-surface"
              >
                1
              </Link>
              {pageNumbers[0] > 2 && (
                <span className="text-text-muted px-1">…</span>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <Link
              key={pageNum}
              href={pageHref(pageNum)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                pageNum === page
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-navy hover:bg-surface"
              }`}
            >
              {pageNum}
            </Link>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="text-text-muted px-1">…</span>
              )}
              <Link
                href={pageHref(totalPages)}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-border text-navy hover:bg-surface"
              >
                {totalPages}
              </Link>
            </>
          )}

          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-border text-navy hover:bg-surface"
            >
              Next ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
