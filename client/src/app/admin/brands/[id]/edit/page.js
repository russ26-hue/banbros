import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import BrandForm from "@/components/BrandForm";

async function getBrand(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/brands/admin/${id}`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch brand (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.brand;
}

export default async function EditBrandPage({ params }) {
  const { id } = await params;
  const brand = await getBrand(id);

  if (!brand) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Edit Brand</h1>
      <BrandForm mode="edit" initialData={brand} brandId={id} />
    </div>
  );
}
