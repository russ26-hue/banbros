import Link from "next/link";

const SECTIONS = [
  {
    key: "hero",
    label: "Hero Carousel",
    description: "Manage homepage hero slides (image, title, button).",
    href: "/admin/cms/hero",
  },
  {
    key: "purpose_statement",
    label: "Purpose Statement",
    description: 'The "Our Purpose" section on the homepage.',
    href: "/admin/cms/purpose",
  },
  {
    key: "featured_products_heading",
    label: "Featured Products Heading",
    description: "Title and subtitle above the featured products grid.",
    href: "/admin/cms/featured-products-heading",
  },
  {
    key: "about",
    label: "About Page",
    description: "Company description, strategy, mission & vision, and awards.",
    href: "/admin/cms/about",
  },
];

export default function CmsIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">CMS Content</h1>

      <div className="space-y-3 max-w-2xl">
        {SECTIONS.map((section) => (
          <Link
            key={section.key}
            href={section.href}
            className="block bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-navy">{section.label}</p>
            <p className="text-sm text-text-muted mt-1">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
