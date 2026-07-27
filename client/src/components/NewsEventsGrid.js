import Link from "next/link";

export default function NewsEventsGrid({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            News &amp; Events
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="group block"
            >
              <div className="aspect-square bg-white/5 border-2 border-white/40 rounded-lg overflow-hidden">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
                    No image
                  </div>
                )}
              </div>
              <p className="text-white text-sm font-medium text-center mt-3">
                {post.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
