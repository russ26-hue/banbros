import Link from "next/link";
import CareersCollage from "@/components/CareersCollage";

async function getCollage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/careers`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.sections?.collage?.images || [];
}

async function getJobs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/careers`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch job postings");
  const data = await res.json();
  return data.jobs;
}

export default async function CareersPage() {
  const [collageImages, jobs] = await Promise.all([getCollage(), getJobs()]);

  return (
    <main>
      {/* Collage */}
      <CareersCollage images={collageImages} />

      {/* Who is Banbros */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
            Who is Banbros Commercial Inc.
          </h2>
          <p className="text-text-muted leading-relaxed text-justify">
            Founded in 1997, we are a leading IT distributor and solutions
            provider in the Philippines, delivering cybersecurity, networking,
            enterprise IT, power protection, and consumer business solutions. By
            partnering with industry-leading brands, we provide innovative,
            secure, and scalable technologies, backed by value-added services,
            technical expertise, and business support that help businesses,
            government institutions, and system integrators achieve growth and
            accelerate digital transformation.
          </p>
        </div>
      </section>

      {/* We are looking for */}
      <section className="bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy text-center mb-10">
            We are looking for
          </h2>

          {jobs.length === 0 ? (
            <p className="text-center text-text-muted">
              There are no open positions at the moment. Check back soon!
            </p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/careers/${job.slug}`}
                  className="block bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-navy mb-2">
                    {job.title}
                  </h3>
                  <p className="text-text-muted text-sm line-clamp-2">
                    {job.description
                      ?.replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()}
                  </p>
                  <span className="inline-block text-primary text-sm font-semibold mt-3">
                    View details & apply →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
