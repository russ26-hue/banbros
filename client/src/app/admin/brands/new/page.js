import BrandForm from "@/components/BrandForm";

export default function NewBrandPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Add Brand</h1>
      <BrandForm mode="create" />
    </div>
  );
}
