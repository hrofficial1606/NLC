const features = [
  { title: "Garba\nNight", tone: "light", style: "script" },
  { title: "Cultural\nEvents", tone: "light", style: "serif" },
  { title: "Community\nMeet up", tone: "mid", style: "mixed" },
  { title: "Workshops", tone: "dark", style: "script" },
];

function FeatureCard({ title, tone, style }) {
  return (
    <article className={`feature-card feature-card--${tone}`}>
      <h3 className={`feature-card__title feature-card__title--${style}`}>
        {title.split("\n").map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h3>
    </article>
  );
}

export default function FeatureCards() {
  return (
    <section className="feature-grid">
      <div className="container feature-grid__inner">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
