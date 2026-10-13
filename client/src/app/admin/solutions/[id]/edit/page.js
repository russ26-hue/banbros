import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import SolutionForm from "@/components/SolutionForm";

async function getBrands() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.brands;
}

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solutions/categories`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories;
}

async function getSolution(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solutions/admin/${id}`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch solution (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.solution;
}

export default async function EditSolutionPage({ params }) {
  const { id } = await params;
  const [brands, categories, solution] = await Promise.all([
    getBrands(),
    getCategories(),
    getSolution(id),
  ]);

  if (!solution) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Edit Solution</h1>
      <SolutionForm
        mode="edit"
        brands={brands}
        categories={categories}
        initialData={solution}
        solutionId={id}
      />
    </div>
  );
}
