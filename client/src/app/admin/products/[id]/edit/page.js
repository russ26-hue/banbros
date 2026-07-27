import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";

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

async function getBrands() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch brands");
  const data = await res.json();
  return data.brands;
}

async function getProduct(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/admin/${id}`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch product (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.product;
}

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [categories, brands, product] = await Promise.all([
    getCategories(),
    getBrands(),
    getProduct(id),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Edit Product</h1>
      <ProductForm
        mode="edit"
        categories={categories}
        brands={brands}
        initialData={product}
        productId={id}
      />
    </div>
  );
}
