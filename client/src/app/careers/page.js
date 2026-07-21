import Link from "next/link";

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
      {collageImages.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {collageImages.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`Banbros team ${i + 1}`}
              className="w-full aspect-square object-cover"
            />
          ))}
        </section>
      )}

      {/* Who is Banbros */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
            Who is Banbros Commercial Inc.
          </h2>
          <p className="text-text-muted leading-relaxed">
            Banbros Commercial Inc. is a technology solutions provider dedicated
            to delivering enterprise-grade hardware, components, and IT
            infrastructure to businesses across the Philippines. We're a team
            driven by performance, reliability, and a genuine passion for
            helping our clients grow with the right technology behind them.
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
                    {job.description}
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
