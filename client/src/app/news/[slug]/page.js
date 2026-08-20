import { notFound } from "next/navigation";

async function getPost(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${slug}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch post");
  const data = await res.json();
  return data.post;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const {
    title,
    body,
    cover_image_url: coverImageUrl,
    published_at: publishedAt,
    author_name: authorName,
  } = post;

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {coverImageUrl && (
        <div className="aspect-[16/9] bg-surface rounded-xl overflow-hidden mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-3">{title}</h1>

      <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
        {authorName && <span>{authorName}</span>}
        {authorName && formattedDate && <span>&middot;</span>}
        {formattedDate && <span>{formattedDate}</span>}
      </div>

      {body && (
        <div
          className="text-text-muted leading-relaxed
            [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_h2]:mt-5 [&_h2]:mb-2
            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-navy [&_h3]:mt-4 [&_h3]:mb-2
            [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-navy [&_h4]:mt-3 [&_h4]:mb-2
            [&_strong]:font-bold [&_strong]:text-navy [&_em]:italic
            [&_a]:text-primary [&_a]:underline
            [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}
    </main>
  );
}
