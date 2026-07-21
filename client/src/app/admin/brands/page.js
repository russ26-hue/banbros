import Link from "next/link";
import { cookies } from "next/headers";
import DeleteBrandButton from "@/components/DeleteBrandButton";

async function getBrands() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/brands/admin/all`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch brands (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.brands;
}

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Brands</h1>
        <Link
          href="/admin/brands/new"
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Add Brand
        </Link>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy">Logo</th>
              <th className="px-4 py-3 font-semibold text-navy">Name</th>
              <th className="px-4 py-3 font-semibold text-navy">Order</th>
              <th className="px-4 py-3 font-semibold text-navy">Active</th>
              <th className="px-4 py-3 font-semibold text-navy text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-12 h-12 object-contain bg-surface rounded p-1"
                  />
                </td>
                <td className="px-4 py-3 text-navy font-medium">
                  {brand.name}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {brand.sort_order}
                </td>
                <td className="px-4 py-3">{brand.is_active ? "✅" : "—"}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/brands/${brand.id}/edit`}
                    className="text-primary font-semibold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteBrandButton
                    brandId={brand.id}
                    brandName={brand.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {brands.length === 0 && (
          <p className="text-center text-text-muted py-10">No brands yet.</p>
        )}
      </div>
    </div>
  );
}
