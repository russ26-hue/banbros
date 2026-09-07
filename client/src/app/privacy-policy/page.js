export const metadata = {
  title: "Privacy Policy | Banbros",
  description:
    "How Banbros Commercial Incorporated collects, uses, and protects personal information.",
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

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-navy mb-2">Privacy Policy</h1>
      <p className="text-sm text-text-muted mb-10">
        Last updated: {LAST_UPDATED}
      </p>

      <Section title="1. Introduction">
        <p>
          Banbros Commercial Incorporated (&ldquo;Banbros&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy and is
          committed to protecting the personal information you share with us
          through this website.
        </p>
        <p>
          This policy explains what information we collect, why we collect it,
          how long we keep it, and the rights available to you under Republic
          Act No. 10173, the Data Privacy Act of 2012.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <p>
          We collect personal information only when you choose to provide it:
        </p>
        <p>
          <strong className="text-navy">Contact enquiries.</strong> When you
          submit our contact form, we collect your name, email address, phone
          number (if provided), subject, and the content of your message.
        </p>
        <p>
          <strong className="text-navy">Job applications.</strong> When you
          apply for a position, we collect your name, email address, your resume
          or curriculum vitae, and any cover letter you provide. Resumes
          commonly contain additional personal information such as your address,
          employment history, and educational background.
        </p>
        <p>
          <strong className="text-navy">Technical information.</strong> Our
          servers record the IP address and browser identifier associated with
          form submissions and administrative activity. This is used for
          security purposes, such as detecting abuse.
        </p>
        <p>
          We do not use advertising trackers, analytics services, or third-party
          marketing cookies on this website.
        </p>
      </Section>

      <Section title="3. How we use your information">
        <p>
          Contact enquiries are used solely to respond to your message and,
          where relevant, to follow up about our products and services.
        </p>
        <p>
          Job applications are used solely to assess your suitability for the
          position applied for, and for other roles at Banbros during the
          retention period described below.
        </p>
        <p>
          We do not sell your personal information, and we do not share it with
          third parties for marketing purposes.
        </p>
      </Section>

      <Section title="4. Cookies">
        <p>
          This website uses a single cookie, which stores an authentication
          token for staff who log in to the administrative dashboard. It is
          strictly necessary for the website to function and is not used to
          track visitors.
        </p>
        <p>
          If you are browsing the public website without logging in, no cookies
          are placed on your device.
        </p>
      </Section>

      <Section title="5. How long we keep your information">
        <p>
          <strong className="text-navy">Job applications and resumes</strong>{" "}
          are retained for one (1) year from the date of submission, after which
          they are deleted. This allows us to consider you for other suitable
          roles that may arise.
        </p>
        <p>
          <strong className="text-navy">Contact enquiries</strong> are retained
          for as long as necessary to respond to and resolve your enquiry, and
          for a reasonable period afterwards for record-keeping.
        </p>
        <p>
          <strong className="text-navy">Security records</strong>, including
          login activity and IP addresses, are retained for security and audit
          purposes.
        </p>
      </Section>

      <Section title="6. How we protect your information">
        <p>
          Information submitted through this website is transmitted over an
          encrypted connection (HTTPS). Access to submitted enquiries and job
          applications is restricted to authorised Banbros staff, who must
          authenticate before viewing them. Resumes are not publicly accessible
          and can only be retrieved by authenticated staff.
        </p>
        <p>
          Administrative access is role-based, protected by password
          requirements and account lockout after repeated failed login attempts,
          and all access to applicant information is recorded in an internal
          activity log.
        </p>
        <p>
          While we take these measures seriously, no method of transmission or
          storage is completely secure, and we cannot guarantee absolute
          security.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>
          Under the Data Privacy Act of 2012, you have the right to be informed
          about how your personal information is processed, to access the
          information we hold about you, to correct inaccurate information, to
          object to processing, and to request erasure of your information.
        </p>
        <p>
          To exercise any of these rights, contact us using the details in
          section 9. We will respond within a reasonable period.
        </p>
        <p>
          You also have the right to lodge a complaint with the National Privacy
          Commission if you believe your rights have been infringed.
        </p>
      </Section>

      <Section title="8. Changes to this policy">
        <p>
          We may update this policy from time to time. The date at the top of
          this page indicates when it was last revised. Material changes will be
          reflected here.
        </p>
      </Section>

      <Section title="9. Contact us">
        <p>
          For questions about this policy, or to exercise your rights regarding
          your personal information, contact us at:
        </p>
        <p>
          <strong className="text-navy">Banbros Commercial Inc.</strong>
          <br />
          Email: href="mailto:info@banbros.ph" className="text-primary
          hover:underline"
          <a>info@banbros.ph</a>
        </p>
      </Section>
    </main>
  );
}
