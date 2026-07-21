import JobForm from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Add Job Posting</h1>
      <JobForm mode="create" />
    </div>
  );
}
