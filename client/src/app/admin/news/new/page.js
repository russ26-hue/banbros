import NewsForm from "@/components/NewsForm";

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Add Article</h1>
      <NewsForm mode="create" />
    </div>
  );
}
