import { cookies } from "next/headers";
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

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Add Product</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
