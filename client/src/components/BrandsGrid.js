import Link from "next/link";

function BrandLogo({ brand }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo_url}
      alt={brand.name}
      className="max-h-full max-w-full object-contain transition-transform duration-200 hover:scale-110"
    />
  );
}

function BrandTile({ brand }) {
  const hasProducts = (brand.product_count || 0) > 0;
  const tileClass = "flex items-center justify-center h-20 p-3";

  // Brands with products link to their filtered catalogue. Brands without
  // would land on an empty results page, so those fall back to the brand's
  // own website instead.
  if (hasProducts) {
    return (
      <Link href={`/products?brand=${brand.slug}`} className={tileClass}>
        <BrandLogo brand={brand} />
      </Link>
    );
  }

  if (brand.website_url) {
    return (
      <a
        href={brand.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className={tileClass}
      >
        <BrandLogo brand={brand} />
      </a>
    );
  }

  // No products and no website: show the logo without making it clickable,
  // rather than linking somewhere that leads nowhere useful.
  return (
    <div className={tileClass}>
      <BrandLogo brand={brand} />
    </div>
  );
}

function BrandColumn({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
      {brands.map((brand) => (
        <BrandTile key={brand.id} brand={brand} />
      ))}
    </div>
  );
}

export default function BrandsGrid({ brands }) {
  if (!brands || brands.length === 0) return null;

  const corporateBrands = brands.filter((b) => b.division === "corporate");
  const commercialBrands = brands.filter((b) => b.division === "commercial");

  const hasBoth = corporateBrands.length > 0 && commercialBrands.length > 0;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">Brands</h2>
        </div>

        {/* Stacks on mobile, splits into two columns from md upward. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 md:gap-y-0 md:gap-x-10">
          <div className={hasBoth ? "md:pr-10" : ""}>
            <BrandColumn brands={corporateBrands} />
          </div>

          <div
            className={hasBoth ? "md:border-l md:border-border md:pl-10" : ""}
          >
            <BrandColumn brands={commercialBrands} />
          </div>
        </div>
      </div>
    </section>
  );
}
