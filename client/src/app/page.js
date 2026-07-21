import HeroCarousel from "@/components/HeroCarousel";
import BrandsGrid from "@/components/BrandsGrid";
import PurposeSection from "@/components/PurposeSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import NewsEventsGrid from "@/components/NewsEventsGrid";

async function getHomeContent() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/home`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch home content");
  const data = await res.json();
  return data.sections;
}

async function getBrands() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch brands");
  const data = await res.json();
  return data.brands;
}

async function getFeaturedProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?featured=true&limit=4`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch featured products");
  const data = await res.json();
  return data.products;
}

async function getLatestNews() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news?limit=3`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch latest news");
  const data = await res.json();
  return data.posts;
}

export default async function Home() {
  const [sections, brands, featuredProducts, latestNews] = await Promise.all([
    getHomeContent(),
    getBrands(),
    getFeaturedProducts(),
    getLatestNews(),
  ]);

  return (
    <main>
      <HeroCarousel slides={sections.hero?.slides || []} />
      <PurposeSection content={sections.purpose_statement} />
      <FeaturedProducts
        heading={sections.featured_products_heading}
        products={featuredProducts}
      />
      <BrandsGrid brands={brands} />
      <NewsEventsGrid posts={latestNews} />
    </main>
  );
}
