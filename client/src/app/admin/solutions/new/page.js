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

export default async function NewSolutionPage() {
  const [brands, categories] = await Promise.all([
    getBrands(),
    getCategories(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Add Solution</h1>
      <SolutionForm mode="create" brands={brands} categories={categories} />
    </div>
  );
}
