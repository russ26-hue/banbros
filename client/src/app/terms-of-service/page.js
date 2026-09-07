export const metadata = {
  title: "Terms of Service | Banbros",
  description:
    "Terms governing the use of the Banbros Commercial Incorporated website.",
};

const LAST_UPDATED = "September 2026";

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-navy mb-3">{title}</h2>
      <div className="text-text-muted leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-navy mb-2">Terms of Service</h1>
      <p className="text-sm text-text-muted mb-10">
        Last updated: {LAST_UPDATED}
      </p>

      <Section title="1. Acceptance of these terms">
        <p>
          These terms govern your use of the website operated by Banbros
          Commercial Incorporated (&ldquo;Banbros&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;). By accessing or using this website, you agree to be
          bound by them. If you do not agree, please do not use the website.
        </p>
      </Section>

      <Section title="2. About this website">
        <p>
          This website is provided for informational purposes. It presents our
          product catalogue, the brands we represent, company news, and career
          opportunities.
        </p>
        <p>
          Products shown on this website are not offered for sale directly
          through the site, and no prices are displayed. Product listings are
          invitations to enquire, not offers to sell. Any sale is subject to a
          separate agreement, including availability, pricing, and terms agreed
          at that time.
        </p>
      </Section>

      <Section title="3. Acceptable use">
        <p>You agree not to use this website to:</p>
        <p>
          Submit false, misleading, unlawful, defamatory, or offensive content
          through any form on this website; impersonate another person or
          organisation; upload files containing malicious code; attempt to gain
          unauthorised access to any part of the website, its administrative
          areas, or its underlying systems; interfere with the normal operation
          of the website, including through automated scraping, excessive
          requests, or attempts to circumvent rate limits; or copy, reproduce,
          or redistribute the contents of this website for commercial purposes
          without our written permission.
        </p>
        <p>
          We may restrict or block access to this website where we reasonably
          believe it is being used in breach of these terms.
        </p>
      </Section>

      <Section title="4. Submissions to this website">
        <p>
          When you submit an enquiry or a job application, you confirm that the
          information you provide is accurate and that you are entitled to share
          it.
        </p>
        <p>
          Personal information you submit is handled in accordance with our{" "}
          <a href="/privacy-policy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          Submitting a job application does not create any employment
          relationship or guarantee of consideration, interview, or employment.
        </p>
      </Section>

      <Section title="5. Accuracy of information">
        <p>
          We take reasonable care to keep the information on this website
          accurate and current. However, product specifications, availability,
          brand partnerships, and other details may change without notice, and
          may contain errors or omissions.
        </p>
        <p>
          Information on this website should not be relied upon as the sole
          basis for a purchasing decision. Please contact us to confirm current
          details before making any commitment.
        </p>
      </Section>

      <Section title="6. Intellectual property">
        <p>
          The content of this website, including text, layout, graphics, and the
          Banbros name and logo, is the property of Banbros or its licensors.
        </p>
        <p>
          Third-party brand names, logos, and product images shown on this
          website remain the property of their respective owners and are used to
          identify the products and brands we represent.
        </p>
      </Section>

      <Section title="7. External links">
        <p>
          This website may contain links to third-party websites. We do not
          control those sites and are not responsible for their content,
          availability, or privacy practices. A link does not imply endorsement.
        </p>
      </Section>

      <Section title="8. Availability">
        <p>
          We aim to keep this website available at all times, but we do not
          guarantee uninterrupted access. The website may be unavailable during
          maintenance, or due to circumstances outside our control. We may
          modify, suspend, or discontinue any part of the website without
          notice.
        </p>
      </Section>

      <Section title="9. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Banbros shall not be liable
          for any indirect or consequential loss arising from your use of, or
          inability to use, this website, or from reliance on information
          published on it.
        </p>
        <p>
          Nothing in these terms limits liability that cannot lawfully be
          limited.
        </p>
      </Section>

      <Section title="10. Changes to these terms">
        <p>
          We may revise these terms from time to time. The date at the top of
          this page indicates when they were last updated. Continued use of the
          website after a revision constitutes acceptance of the revised terms.
        </p>
      </Section>

      <Section title="11. Governing law">
        <p>
          These terms are governed by the laws of the Republic of the
          Philippines. Any dispute arising from them shall be subject to the
          exclusive jurisdiction of the courts of the Philippines.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Questions about these terms can be directed to{" "}
          <a
            href="mailto:info@banbros.ph"
            className="text-primary hover:underline"
          >
            info@banbros.ph
          </a>
          .
        </p>
      </Section>
    </main>
  );
}
