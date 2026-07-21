import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import JobForm from "@/components/JobForm";

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

export default async function EditJobPage({ params }) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Edit Job Posting</h1>
      <JobForm mode="edit" initialData={job} jobId={id} />
    </div>
  );
}
