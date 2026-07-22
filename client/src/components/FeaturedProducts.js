import ProductCard from "./ProductCard";

function DottedWave({ side }) {
  const flip = side === "right" ? "scale(-1,1)" : "";
  return (
    <svg
      className={`absolute top-0 h-full w-64 sm:w-96 pointer-events-none ${
        side === "left" ? "left-0" : "right-0"
      }`}
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: flip }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`dots-${side}`}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.6" className="fill-primary" />
        </pattern>
        <linearGradient id={`fade-${side}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="60%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id={`mask-${side}`}>
          <rect width="400" height="600" fill={`url(#fade-${side})`} />
        </mask>
      </defs>
      <g mask={`url(#mask-${side})`} opacity="1">
        <path
          d="M -50 80 C 60 120, 120 40, 220 90 S 340 220, 260 300 S 100 380, 180 460 S 360 520, 300 620"
          fill="none"
          stroke="none"
        />
        <rect
          x="-50"
          y="0"
          width="450"
          height="600"
          fill={`url(#dots-${side})`}
          style={{
            clipPath:
              "path('M -50 80 C 60 120, 120 40, 220 90 S 340 220, 260 300 S 100 380, 180 460 S 360 520, 300 620 L 450 620 L 450 0 L -50 0 Z')",
          }}
        />
      </g>
    </svg>
  );
}

export default function FeaturedProducts({ heading, products }) {
  const { title, subtitle } = heading || {};

  if (!products || products.length === 0) return null;

  return (
    <section className="relative bg-white overflow-hidden">
      <DottedWave side="left" />
      <DottedWave side="right" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
