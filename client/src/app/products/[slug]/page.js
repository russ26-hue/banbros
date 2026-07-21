import { notFound } from "next/navigation";

async function getProduct(slug) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
    {
      cache: "no-store",
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  const data = await res.json();
  return data.product;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return {};

  return {
    title: product.meta_title || product.title,
    description: product.meta_description || product.short_desc || undefined,
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const {
    title,
    description,
    specs,
    features,
    image_url: imageUrl,
    gallery,
    category_name: categoryName,
  } = product;

  const specEntries =
    specs && typeof specs === "object" ? Object.entries(specs) : [];
  const hasFeatures = Array.isArray(features) && features.length > 0;
  const hasGallery = Array.isArray(gallery) && gallery.length > 0;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-[4/3] bg-surface rounded-xl overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
              No image
            </div>
          )}
        </div>

        <div>
          {categoryName && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              {categoryName}
            </p>
          )}
          <h1 className="text-3xl font-bold text-navy mb-4">{title}</h1>
          {description && (
            <p className="text-text-muted leading-relaxed mb-6">
              {description}
            </p>
          )}

          {hasFeatures && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-navy mb-2">Features</h2>
              <ul className="list-disc list-inside text-text-muted space-y-1">
                {features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {specEntries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-navy mb-2">
                Specifications
              </h2>
              <dl className="divide-y divide-border border-t border-border">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 text-sm">
                    <dt className="text-text-muted">{key}</dt>
                    <dd className="text-navy font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {hasGallery && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-navy mb-4">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map((imgUrl, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={imgUrl}
                alt={`${title} gallery ${i + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
