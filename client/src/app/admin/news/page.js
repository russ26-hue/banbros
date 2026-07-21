import Link from "next/link";
import { cookies } from "next/headers";
import DeleteNewsButton from "@/components/DeleteNewsButton";

async function getPosts() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/admin/all`, {
    headers: { Authorization: `Bearer ${token?.value || ""}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch news (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.posts;
}

export default async function AdminNewsPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">News</h1>
        <Link
          href="/admin/news/new"
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Add Article
        </Link>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy">Title</th>
              <th className="px-4 py-3 font-semibold text-navy">Published</th>
              <th className="px-4 py-3 font-semibold text-navy">
                Published At
              </th>
              <th className="px-4 py-3 font-semibold text-navy">Updated</th>
              <th className="px-4 py-3 font-semibold text-navy text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-border">
                <td className="px-4 py-3 text-navy font-medium">
                  {post.title}
                </td>
                <td className="px-4 py-3">{post.is_published ? "✅" : "—"}</td>
                <td className="px-4 py-3 text-text-muted">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(post.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/news/${post.id}/edit`}
                    className="text-primary font-semibold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteNewsButton postId={post.id} postTitle={post.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <p className="text-center text-text-muted py-10">No articles yet.</p>
        )}
      </div>
    </div>
  );
}
