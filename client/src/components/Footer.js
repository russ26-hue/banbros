import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface text-navy/70 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-navy font-bold text-lg mb-3">Banbros</h3>
            <p className="text-sm leading-relaxed">
              Your value added distributor.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-navy font-semibold mb-3 text-sm uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-primary transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-primary transition-colors"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-primary transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-navy font-semibold mb-3 text-sm uppercase tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                32 Pilar Corner, Araullo, San Juan City, 1500 Metro Manila,
                Philippines
              </li>
              <li>+63 928 727 3009</li>
              <li>info@banbros.com</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-navy font-semibold mb-3 text-sm uppercase tracking-wide">
              Stay Connected
            </h4>
            <p className="text-sm mb-3">
              Follow us on Facebook to get the latest updates.
            </p>

            <a
              href="https://www.facebook.com/BanbrosCommercialIncorporated"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center w-9 h-9 bg-navy/10 hover:bg-primary rounded-full transition-colors group"
            >
              <svg
                className="w-4 h-4 fill-navy group-hover:fill-white transition-colors"
                viewBox="0 0 24 24"
              >
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 16.99 22 12z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-sm text-center text-text-muted">
          © {year} Banbros Commercial Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
