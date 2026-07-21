import Link from "next/link";

export default function HeroSection({ content }) {
  const {
    eyebrow,
    title,
    subtitle,
    cta_label: ctaLabel,
    cta_url: ctaUrl,
  } = content || {};

  return (
    <section className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center sm:text-left">
        {eyebrow && (
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight max-w-2xl mx-auto sm:mx-0">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-white/70 text-base sm:text-lg max-w-xl mx-auto sm:mx-0">
            {subtitle}
          </p>
        )}
        {ctaLabel && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-block mt-8 bg-cta hover:bg-cta-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
