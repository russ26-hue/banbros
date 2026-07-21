import Link from "next/link";

export default function NewsCard({ post }) {
  const {
    title,
    slug,
    excerpt,
    cover_image_url: coverImageUrl,
    published_at: publishedAt,
  } = post;

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/news/${slug}`}
      className="group block bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[16/9] bg-surface overflow-hidden">
        {coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        {formattedDate && (
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            {formattedDate}
          </p>
        )}
        <h3 className="font-semibold text-navy group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        {excerpt && (
          <p className="text-sm text-text-muted mt-1 line-clamp-2">{excerpt}</p>
        )}
      </div>
    </Link>
  );
}
