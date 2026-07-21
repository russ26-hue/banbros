import { cookies } from "next/headers";
import MarkReadButton from "@/components/MarkReadButton";

async function getSubmissions() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
    headers: { Authorization: `Bearer ${token?.value || ""}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Failed to fetch submissions (${res.status}): ${errorBody}`,
    );
  }
  const data = await res.json();
  return data.submissions;
}

export default async function AdminContactPage() {
  const submissions = await getSubmissions();
  const unreadCount = submissions.filter((s) => !s.is_read).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-navy">Contact Submissions</h1>
        {unreadCount > 0 && (
          <span className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className={`bg-white border rounded-lg p-5 ${
              submission.is_read ? "border-border" : "border-primary"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold text-navy">
                  {submission.name}
                  {!submission.is_read && (
                    <span className="ml-2 text-xs font-semibold text-primary">
                      NEW
                    </span>
                  )}
                </p>
                <p className="text-sm text-text-muted">{submission.email}</p>
                {submission.phone && (
                  <p className="text-sm text-text-muted">{submission.phone}</p>
                )}
              </div>
              <p className="text-xs text-text-muted whitespace-nowrap">
                {new Date(submission.created_at).toLocaleString()}
              </p>
            </div>

            {submission.subject && (
              <p className="text-sm font-medium text-navy mb-1">
                {submission.subject}
              </p>
            )}
            <p className="text-sm text-text-muted whitespace-pre-line mb-4">
              {submission.message}
            </p>

            {!submission.is_read && (
              <MarkReadButton submissionId={submission.id} />
            )}
          </div>
        ))}

        {submissions.length === 0 && (
          <p className="text-center text-text-muted py-10">
            No submissions yet.
          </p>
        )}
      </div>
    </div>
  );
}
