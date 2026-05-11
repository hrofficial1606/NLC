function SponsorLogo({ sponsor }) {
  return (
    <div className="sponsor-logo" aria-label={sponsor.name}>
      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={`${sponsor.name} logo`}
          className="sponsor-logo__image"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className={`sponsor-logo__mark sponsor-logo__mark--${sponsor.tone}`}>
          <span>{sponsor.badge}</span>
        </div>
      )}
      <span className={`sponsor-logo__wordmark sponsor-logo__wordmark--${sponsor.tone}`}>
        {sponsor.name}
      </span>
    </div>
  );
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
            <SponsorLogo key={sponsor.id ?? sponsor.name} sponsor={sponsor} />
          ))}
        </div>
      </div>
    </section>
  );
}
