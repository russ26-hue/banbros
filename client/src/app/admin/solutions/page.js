import Link from "next/link";
import { cookies } from "next/headers";
import DeleteSolutionButton from "@/components/DeleteSolutionButton";
import FormattedDate from "@/components/FormattedDate";

async function getSolutions() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solutions/admin/all`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch solutions (${res.status}): ${errorBody}`);
  }
  const data = await res.json();
  return data.solutions || [];
}

export default async function AdminSolutionsPage() {
  const solutions = await getSolutions();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Solutions</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {solutions.length} solution{solutions.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/solutions/new"
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Add Solution
        </Link>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy">Tile</th>
              <th className="px-4 py-3 font-semibold text-navy">Title</th>
              <th className="px-4 py-3 font-semibold text-navy">Brand</th>
              <th className="px-4 py-3 font-semibold text-navy">Category</th>
              <th className="px-4 py-3 font-semibold text-navy">PDF</th>
              <th className="px-4 py-3 font-semibold text-navy">Order</th>
              <th className="px-4 py-3 font-semibold text-navy">Published</th>
              <th className="px-4 py-3 font-semibold text-navy">Updated</th>
              <th className="px-4 py-3 font-semibold text-navy text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {solutions.map((solution) => (
              <tr key={solution.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <span
                    className="inline-block w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: solution.tile_color }}
                    aria-hidden="true"
                  />
                </td>
                <td className="px-4 py-3 text-navy font-medium">
                  {solution.title}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {solution.brand_name || "—"}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {solution.category_name || "—"}
                </td>
                <td className="px-4 py-3">
                  {solution.pdf_url ? (
                    <a
                      href={solution.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {solution.sort_order}
                </td>
                <td className="px-4 py-3">
                  {solution.is_published ? "✅" : "—"}
                </td>
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                  <FormattedDate value={solution.updated_at} />
                </td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link
                    href={`/admin/solutions/${solution.id}/edit`}
                    className="text-primary font-semibold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteSolutionButton
                    solutionId={solution.id}
                    solutionTitle={solution.title}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {solutions.length === 0 && (
          <p className="text-center text-text-muted py-10">No solutions yet.</p>
        )}
      </div>
    </div>
  );
}
