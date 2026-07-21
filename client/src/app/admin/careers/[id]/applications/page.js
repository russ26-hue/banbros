import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

async function getJob(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/careers/admin/${id}`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Failed to fetch job posting (${res.status}): ${errorBody}`,
    );
  }
  const data = await res.json();
  return data.job;
}

async function getApplications(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/careers/${id}/applications`,
    {
      headers: { Authorization: `Bearer ${token?.value || ""}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Failed to fetch applications (${res.status}): ${errorBody}`,
    );
  }
  const data = await res.json();
  return data.applications;
}

export default async function JobApplicationsPage({ params }) {
  const { id } = await params;
  const [job, applications] = await Promise.all([
    getJob(id),
    getApplications(id),
  ]);

  if (!job) notFound();

  return (
    <div>
      <Link
        href="/admin/careers"
        className="text-sm text-primary font-semibold hover:underline"
      >
        ← Back to Careers
      </Link>

      <h1 className="text-2xl font-bold text-navy mt-2 mb-1">Applications</h1>
      <p className="text-text-muted mb-6">{job.title}</p>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-navy">Name</th>
              <th className="px-4 py-3 font-semibold text-navy">Email</th>
              <th className="px-4 py-3 font-semibold text-navy">
                Cover Letter
              </th>
              <th className="px-4 py-3 font-semibold text-navy">Submitted</th>
              <th className="px-4 py-3 font-semibold text-navy text-right">
                Resume
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t border-border align-top">
                <td className="px-4 py-3 text-navy font-medium whitespace-nowrap">
                  {app.applicant_name}
                </td>
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                  {app.applicant_email}
                </td>
                <td className="px-4 py-3 text-text-muted max-w-xs">
                  {app.cover_letter || "—"}
                </td>
                <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                  {new Date(app.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <p className="text-center text-text-muted py-10">
            No applications yet.
          </p>
        )}
      </div>
    </div>
  );
}
