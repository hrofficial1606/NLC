function TestimonialCard() {
  return <article className="testimonial-card" aria-hidden="true" />;
}

export default function Feedback({ testimonials = [] }) {
  const items = testimonials.length ? testimonials : new Array(4).fill(null);

  return (
    <section className="feedback-section" id="blogs">
      <div className="container feedback-section__inner">
        <div className="feedback-section__heading">
          <span className="feedback-section__shadow">FEEDBACK</span>
          <h2>feedback</h2>
        </div>

        <div className="feedback-section__grid">
          {items.map((item, index) => (
            <TestimonialCard key={item?.id ?? index} />
          ))}
        </div>
      </div>
    </section>
  );
}
