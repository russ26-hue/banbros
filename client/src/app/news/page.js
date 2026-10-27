import NewsCard from "@/components/NewsCard";
import Link from "next/link";

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

function Pagination({ page, totalPages }) {
  const linkFor = (pageNum) =>
    pageNum > 1 ? `/news?page=${pageNum}` : "/news";

  const baseClass =
    "px-3 py-2 rounded-lg text-sm font-semibold transition-colors";
  const inactiveClass = `${baseClass} bg-white border border-border text-navy hover:bg-surface`;
  const activeClass = `${baseClass} bg-primary text-white`;

  // Show a window of pages around the current one rather than every page.
  const windowSize = 2;
  const pages = [];
  for (
    let i = Math.max(1, page - windowSize);
    i <= Math.min(totalPages, page + windowSize);
    i++
  ) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
      {page > 1 && (
        <Link href={linkFor(page - 1)} className={inactiveClass}>
          ‹ Previous
        </Link>
      )}

      {pages[0] > 1 && (
        <>
          <Link href={linkFor(1)} className={inactiveClass}>
            1
          </Link>
          {pages[0] > 2 && <span className="text-text-muted px-1">…</span>}
        </>
      )}

      {pages.map((pageNum) => (
        <Link
          key={pageNum}
          href={linkFor(pageNum)}
          className={pageNum === page ? activeClass : inactiveClass}
        >
          {pageNum}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-text-muted px-1">…</span>
          )}
          <Link href={linkFor(totalPages)} className={inactiveClass}>
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages && (
        <Link href={linkFor(page + 1)} className={inactiveClass}>
          Next ›
        </Link>
      )}
    </div>
  );
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

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </main>
  );
}
