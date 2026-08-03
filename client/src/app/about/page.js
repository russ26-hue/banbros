async function getAboutContent() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/about`, {
    cache: "no-store",
  });
  if (!res.ok) return {};
  const data = await res.json();
  return data.sections || {};
}

export async function generateMetadata() {
  const sections = await getAboutContent();
  return {
    title: sections.company?.title
      ? `${sections.company.title} | Banbros`
      : "About Us | Banbros",
    description: sections.company?.body || undefined,
  };
}

export default async function AboutPage() {
  const sections = await getAboutContent();

  const company = sections.company || {};
  const strategy = sections.strategy || {};
  const missionVision = sections.mission_vision || {};
  const awards = Array.isArray(sections.awards?.items)
    ? sections.awards.items
    : [];

  const hasAnyContent =
    company.title ||
    company.body ||
    strategy.title ||
    strategy.body ||
    missionVision.mission ||
    missionVision.vision ||
    awards.length > 0;

  if (!hasAnyContent) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
          About Us
        </h1>
        <p className="text-text-muted">
          Content for this page hasn&apos;t been added yet.
        </p>
      </main>
    );
  }

  return (
    <main>
      {/* About the Company */}
      {(company.title || company.body) && (
        <section className="bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-2">
              About Us
            </p>
            {company.title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
                {company.title}
              </h1>
            )}
            {company.body && (
              <p className="text-text-muted leading-relaxed whitespace-pre-line">
                {company.body}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Strategy */}
      {(strategy.title || strategy.body) && (
        <section className="bg-surface">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            {strategy.title && (
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
                {strategy.title}
              </h2>
            )}
            {strategy.body && (
              <p className="text-text-muted leading-relaxed whitespace-pre-line">
                {strategy.body}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      {(missionVision.mission || missionVision.vision) && (
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {missionVision.mission && (
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-navy mb-3">
                    Our Mission
                  </h2>
                  <p className="text-text-muted leading-relaxed whitespace-pre-line">
                    {missionVision.mission}
                  </p>
                </div>
              )}
              {missionVision.vision && (
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-navy mb-3">
                    Our Vision
                  </h2>
                  <p className="text-text-muted leading-relaxed whitespace-pre-line">
                    {missionVision.vision}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Awards & Recognition */}
      {awards.length > 0 && (
        <section className="bg-surface">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy text-center mb-10">
              Awards &amp; Recognition
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {awards.map((award, i) => (
                <div
                  key={i}
                  className="bg-white border border-border rounded-lg p-6 text-center"
                >
                  {award.year && (
                    <p className="text-primary text-sm font-semibold mb-2">
                      {award.year}
                    </p>
                  )}
                  {award.title && (
                    <p className="font-semibold text-navy mb-1">
                      {award.title}
                    </p>
                  )}
                  {award.issuer && (
                    <p className="text-text-muted text-sm">{award.issuer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
