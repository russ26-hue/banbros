const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://banbros.com.ph";

async function getSlugs(endpoint, arrayKey) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data[arrayKey] || [];
  } catch (err) {
    return [];
  }
}

export default async function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/news`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/careers`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const [products, news, jobs] = await Promise.all([
    getSlugs("/products?limit=1000", "products"),
    getSlugs("/news?limit=1000", "posts"),
    getSlugs("/careers", "jobs"),
  ]);

  const productRoutes = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const newsRoutes = news.map((post) => ({
    url: `${SITE_URL}/news/${post.slug}`,
    lastModified: post.published_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const jobRoutes = jobs.map((job) => ({
    url: `${SITE_URL}/careers/${job.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...newsRoutes, ...jobRoutes];
}
