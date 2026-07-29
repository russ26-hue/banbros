export default function CareersCollage({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Diagonal navy wedge behind the photo grid.
          The four points are: top-left, top-right, right side at 45% down,
          left side at 85% down. Raise those percentages to push the wedge
          lower (more navy), lower them to pull it up (less navy). */}
      <div
        className="absolute inset-0 bg-navy pointer-events-none"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 85%)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {images.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`Banbros team ${i + 1}`}
              className="w-full aspect-square object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
