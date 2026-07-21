export default function BrandsGrid({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">Brands</h2>
        </div>
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

            return brand.website_url ? (
              <a
                key={brand.id}
                href={brand.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4"
              >
                {logo}
              </a>
            ) : (
              <div
                key={brand.id}
                className="flex items-center justify-center p-4"
              >
                {logo}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
