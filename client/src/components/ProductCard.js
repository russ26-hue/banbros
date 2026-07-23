import Link from "next/link";

export default function ProductCard({ product }) {
  const {
    title,
    slug,
    short_desc: shortDesc,
    image_url: imageUrl,
    category_name: categoryName,
  } = product;

  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[4/3] bg-surface overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        {categoryName && (
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            {categoryName}
          </p>
        )}
        <h3 className="font-semibold text-navy group-hover:text-primary transition-colors">
          {title}
        </h3>
        {shortDesc && (
          <p className="text-sm text-text-muted mt-1 line-clamp-2">
            {shortDesc}
          </p>
        )}
      </div>
    </Link>
  );
}
