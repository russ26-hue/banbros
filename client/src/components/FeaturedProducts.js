import ProductCard from "./ProductCard";

export default function FeaturedProducts({ heading, products }) {
  const { title, subtitle } = heading || {};

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-text-muted mt-2">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
