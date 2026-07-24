export const metadata = {
  title: "About Us | Banbros",
  description:
    "Learn more about Banbros Commercial Incorporated — our company, strategy, mission, and recognitions.",
};

const AWARDS = [
  {
    year: "2025",
    title: "Outstanding Technology Partner",
    issuer: "Ruckus Networks",
  },
  { year: "2024", title: "Top Distributor Award", issuer: "Viettel Security" },
  {
    year: "2023",
    title: "Excellence in Enterprise Solutions",
    issuer: "Sony Professional",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* About the Company */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-2">
            About Us
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
            About Banbros Commercial Inc.
          </h1>
          <p className="text-text-muted leading-relaxed">
            Founded in 1997, we are a leading IT distributor and solutions
            provider in the Philippines, delivering cybersecurity, networking,
            enterprise IT, power protection, and consumer business solutions. By
            partnering with industry-leading brands, we provide innovative,
            secure, and scalable technologies, backed by value-added services,
            technical expertise, and business support that help businesses,
            government institutions, and system integrators achieve growth and
            accelerate digital transformation.
          </p>
        </div>
      </section>

      {/* Strategy */}
      <section className="bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
            Our Strategy
          </h2>
          <p className="text-text-muted leading-relaxed">
            We provide end-to-end IT solutions that help businesses, government
            agencies, and system integrators adapt to the evolving digital
            landscape. Beyond distribution, we offer pre-sales consultation,
            technical training, and post-sales support for seamless
            implementation and maximum value. Our expanding portfolio of
            cybersecurity, networking, and enterprise IT solutions strengthens
            security, boosts efficiency, and ensures business continuity. Our
            win-win strategy is built on strong partnerships and
            customer-focused innovation. By collaborating with top technology
            brands and insustry experts, we deliver reliable, high-performance
            solutions that drive growth and digital transformation. Through
            technical excellence and strategic collaboration, we create lasting
            success for our partners and customers.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-navy mb-3">Our Mission</h2>
              <p className="text-text-muted leading-relaxed">
                To provide innovative solutions and exceptional pre and
                post-sales support that drive success for our channel partners.
                We are committed to continuously expanding our product portfolio
                to meet the evolving needs of various industries, empowering
                businesses with the right technologies for enhanced security,
                connectivity, and efficiency.
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-navy mb-3">Our Vision</h2>
              <p className="text-text-muted leading-relaxed">
                To be a top solutions provider in the Philippines, delivering
                advanced technologies and a diverse product portfolio to support
                our channel partners' growth. We continuously expand our
                offerings to enhance security, connectivity, and business
                efficiency across industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy text-center mb-10">
            Awards &amp; Recognition
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {AWARDS.map((award, i) => (
              <div
                key={i}
                className="bg-white border border-border rounded-lg p-6 text-center"
              >
                <p className="text-primary text-sm font-semibold mb-2">
                  {award.year}
                </p>
                <p className="font-semibold text-navy mb-1">{award.title}</p>
                <p className="text-text-muted text-sm">{award.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
