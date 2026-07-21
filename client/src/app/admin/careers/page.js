import Link from "next/link";
import { cookies } from "next/headers";
import DeleteJobButton from "@/components/DeleteJobButton";

async function getJobs() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/careers/admin/all`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Failed to fetch job postings (${res.status}): ${errorBody}`,
    );
  }
  const data = await res.json();
  return data.jobs;
}

export default async function AdminCareersPage() {
  const jobs = await getJobs();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Careers</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/careers/collage"
            className="bg-white border border-border text-navy text-sm font-semibold px-4 py-2 rounded-lg hover:bg-surface transition-colors"
          >
            Manage Collage
          </Link>
          <Link
            href="/admin/careers/new"
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Add Job Posting
          </Link>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy">Title</th>
              <th className="px-4 py-3 font-semibold text-navy">Active</th>
              <th className="px-4 py-3 font-semibold text-navy">Updated</th>
              <th className="px-4 py-3 font-semibold text-navy text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-border">
                <td className="px-4 py-3 text-navy font-medium">{job.title}</td>
                <td className="px-4 py-3">{job.is_active ? "✅" : "—"}</td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(job.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/careers/${job.id}/applications`}
                    className="text-navy font-semibold hover:underline"
                  >
                    Applications
                  </Link>
                  <Link
                    href={`/admin/careers/${job.id}/edit`}
                    className="text-primary font-semibold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteJobButton jobId={job.id} jobTitle={job.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {jobs.length === 0 && (
          <p className="text-center text-text-muted py-10">
            No job postings yet.
          </p>
        )}
      </div>
    </div>
  );
}
