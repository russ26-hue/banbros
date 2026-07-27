import Link from "next/link";

function BrandRow({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
      {brands.map((brand) => {
        const logo = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logo_url}
            alt={brand.name}
            className="max-h-20 w-auto mx-auto grayscale hover:grayscale-0 transition-all"
          />
        );

        return (
          <Link
            key={brand.id}
            href={`/products?brand=${brand.slug}`}
            className="flex items-center justify-center p-4"
          >
            {logo}
          </Link>
        );
      })}
    </div>
  );
}

export default function BrandsGrid({ brands }) {
  if (!brands || brands.length === 0) return null;

  const corporateBrands = brands.filter((b) => b.division === "corporate");
  const commercialBrands = brands.filter((b) => b.division === "commercial");

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">Brands</h2>
        </div>

        <div className="space-y-10">
          <BrandRow brands={corporateBrands} />
          {corporateBrands.length > 0 && commercialBrands.length > 0 && (
            <div className="border-t border-border max-w-xs mx-auto" />
          )}
          <BrandRow brands={commercialBrands} />
        </div>
      </div>
    </section>
  );
}
