import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import NewsForm from "@/components/NewsForm";

async function getPost(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/news/admin/${id}`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch article (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.post;
}

export default async function EditNewsPage({ params }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Edit Article</h1>
      <NewsForm mode="edit" initialData={post} postId={id} />
    </div>
  );
}
