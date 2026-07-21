import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us | Banbros",
  description: "Get in touch with the Banbros team.",
};

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy">Contact Us</h1>
        <p className="text-text-muted mt-2">
          Have a question or want to work with us? Send us a message.
        </p>
      </div>

      <ContactForm />
    </main>
  );
}
