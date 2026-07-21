import NewsCard from "./NewsCard";

export default function LatestNews({ heading, posts }) {
  const { title, subtitle } = heading || {};

  if (!posts || posts.length === 0) return null;

  return (
    <section className="bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-text-muted mt-2">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
