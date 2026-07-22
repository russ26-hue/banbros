import NewsCard from "@/components/NewsCard";

async function getNews(page) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/news?page=${page}&limit=9`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export default async function NewsPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page || "1", 10);

  const { posts, total, limit } = await getNews(page);
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy">News</h1>
        <p className="text-text-muted mt-2">
          Latest updates and announcements from Banbros
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-text-muted py-16">No articles yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <a
                key={pageNum}
                href={pageNum > 1 ? `/news?page=${pageNum}` : "/news"}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pageNum === page
                    ? "bg-primary text-white"
                    : "bg-white border border-border text-navy hover:bg-surface"
                }`}
              >
                {pageNum}
              </a>
            ),
          )}
        </div>
      )}
    </main>
  );
}
