"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";

export default function JobDetailPage() {
  const params = useParams();
  const { slug } = params;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | submitting | error | success
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/careers/${slug}`,
          {
            cache: "no-store",
          },
        );
        if (res.status === 404) {
          setNotFoundState(true);
          return;
        }
        const data = await res.json();
        setJob(data.job);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!resumeFile) {
      setErrorMessage("Please attach your resume.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("applicantName", name);
    formData.append("applicantEmail", email);
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resumeFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/careers/${job.id}/apply`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to submit application.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-text-muted">
        Loading...
      </main>
    );
  }

  if (notFoundState) {
    notFound();
  }

  if (!job) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-navy mb-4">{job.title}</h1>

      <p className="text-text-muted leading-relaxed mb-6">{job.description}</p>

      {Array.isArray(job.qualifications) && job.qualifications.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-navy mb-2">
            Qualifications
          </h2>
          <ul className="list-disc list-inside text-text-muted space-y-1">
            {job.qualifications.map((qualification, i) => (
              <li key={i}>{qualification}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">
          Apply for this position
        </h2>

        {status === "success" ? (
          <div className="text-center py-6">
            <p className="text-navy font-semibold mb-1">
              Application submitted!
            </p>
            <p className="text-text-muted text-sm">
              Thanks for applying — our team will review your application and
              reach out if there's a fit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Cover Letter
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1">
                Resume{" "}
                <span className="text-text-muted font-normal">
                  (PDF, DOC, or DOCX)
                </span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                required
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
