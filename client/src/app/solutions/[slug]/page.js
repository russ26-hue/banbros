import Link from "next/link";
import { notFound } from "next/navigation";

async function getSolution(slug) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solutions/${slug}`,
    { cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch solution");
  const data = await res.json();
  return data.solution;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const solution = await getSolution(slug);

  if (!solution) return {};

  return {
    title: solution.meta_title || `${solution.title} | Banbros`,
    description: solution.meta_description || solution.short_desc || undefined,
  };
}

export default async function SolutionDetailPage({ params }) {
  const { slug } = await params;
  const solution = await getSolution(slug);

  if (!solution) notFound();

  const {
    title,
    short_desc: shortDesc,
    description,
    tile_color: tileColor,
    pdf_url: pdfUrl,
    brand_name: brandName,
    brand_slug: brandSlug,
    category_name: categoryName,
    category_slug: categorySlug,
  } = solution;

  return (
    <main>
      {/* Banner uses the solution's own tile colour, so the detail page is
          visually continuous with the tile that led here. */}
      <section style={{ backgroundColor: tileColor }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {(brandName || categoryName) && (
            <p className="text-white/70 text-sm font-semibold uppercase tracking-wide mb-3">
              {[brandName, categoryName].filter(Boolean).join(" / ")}
            </p>
          )}
          <h1 className="text-white text-3xl sm:text-4xl font-bold">{title}</h1>
          {shortDesc && (
            <p className="text-white/80 mt-3 max-w-2xl mx-auto">{shortDesc}</p>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={
            brandSlug
              ? `/solutions?brand=${brandSlug}`
              : categorySlug
                ? `/solutions?category=${categorySlug}`
                : "/solutions"
          }
          className="text-sm text-primary font-semibold hover:underline"
        >
          ← Back to Solutions
        </Link>

        {description && (
          <div
            className="mt-6 text-text-muted leading-relaxed
              [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_h2]:mt-5 [&_h2]:mb-2
              [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-navy [&_h3]:mt-4 [&_h3]:mb-2
              [&_strong]:font-bold [&_strong]:text-navy [&_em]:italic
              [&_a]:text-primary [&_a]:underline
              [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {pdfUrl && (
          <div className="mt-10 bg-surface border border-border rounded-lg p-6 text-center">
            <p className="text-navy font-semibold mb-1">Service overview</p>
            <p className="text-text-muted text-sm mb-4">
              Download the full details for this solution.
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                />
              </svg>
              View PDF
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
