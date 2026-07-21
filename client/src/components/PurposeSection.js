export default function PurposeSection({ content }) {
  const { title, body } = content || {};

  return (
    <section className="bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
            {title}
          </h2>
        )}
        {body && (
          <p className="text-text-muted text-base sm:text-lg leading-relaxed">
            {body}
          </p>
        )}
      </div>
    </section>
  );
}
