function SponsorLogo({ name }) {
  return <div className="sponsor-logo">{name}</div>;
}

export default function Sponsors({ sponsors = [] }) {
  return (
    <section className="sponsors-section">
      <div className="container sponsors-section__inner">
        <div className="sponsors-section__title-wrap">
          <span className="sponsors-section__line" />
          <h2>Sponsors</h2>
          <span className="sponsors-section__line" />
        </div>

        <div className="sponsors-section__grid">
          {sponsors.map((sponsor) => (
            <SponsorLogo key={sponsor} name={sponsor} />
          ))}
        </div>
      </div>
    </section>
  );
}
