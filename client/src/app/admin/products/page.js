import Link from "next/link";
import { cookies, headers } from "next/headers";
import DeleteProductButton from "@/components/DeleteProductButton";

async function getProducts() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/admin/all`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch products (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.products;
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy">Image</th>
              <th className="px-4 py-3 font-semibold text-navy">Title</th>
              <th className="px-4 py-3 font-semibold text-navy">Category</th>
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
                      className="w-12 h-12 object-cover rounded"
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
                <td className="px-4 py-3">
                  {product.is_featured ? "✅" : "—"}
                </td>
                <td className="px-4 py-3">
                  {product.is_published ? "✅" : "—"}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(product.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
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
          <p className="text-center text-text-muted py-10">No products yet.</p>
        )}
      </div>
    </div>
  );
}
