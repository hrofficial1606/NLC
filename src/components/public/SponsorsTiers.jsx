// Display labels for sponsor tiers.
// Tier values come from the backend Sponsor model — do NOT add new tiers here.
const TIER_LABELS = {
  PLATINUM: "Platinum Partners",
  GOLD: "Gold Partners",
  SILVER: "Silver Partners",
  BRONZE: "Bronze Partners",
};

const TIER_ORDER = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];

// Reusable sponsor card: logo + name + (optional) website link.
export function SponsorCard({ sponsor }) {
  if (!sponsor) return null;
  const { name, logoUrl, websiteUrl } = sponsor;
  const isLink = Boolean(websiteUrl);

  const inner = (
    <>
      <div className="sponsor-card__logo">
        {logoUrl ? (
          <img src={logoUrl} alt={name ? `${name} logo` : "Sponsor logo"} loading="lazy" />
        ) : (
          <span className="sponsor-card__placeholder" aria-hidden="true">{name?.[0] || "✦"}</span>
        )}
      </div>
      <p className="sponsor-card__name">{name || "Partner"}</p>
    </>
  );

  if (isLink) {
    return (
      <a
        className="sponsor-card sponsor-card--linked"
        href={websiteUrl}
        target="_blank"
        rel="noreferrer noopener"
      >
        {inner}
      </a>
    );
  }
  return <div className="sponsor-card">{inner}</div>;
}

export default function SponsorsPage({ sponsors = [] }) {
  const list = Array.isArray(sponsors) ? sponsors : [];
  const hasAny = list.length > 0;

  // Group by tier, preserving the canonical tier order.
  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier] || tier,
    items: list.filter((s) => (s.tier || "").toUpperCase() === tier && s.active !== false),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="sponsors-tiers">
      {grouped.map((group) => (
        <div key={group.tier} className={`sponsors-tier sponsors-tier--${group.tier.toLowerCase()}`}>
          <h3 className="sponsors-tier__label">{group.label}</h3>
          <div className={`sponsors-grid sponsors-grid--${group.tier.toLowerCase()}`}>
            {group.items.map((s) => (
              <SponsorCard key={s.id} sponsor={s} />
            ))}
          </div>
        </div>
      ))}
      {!grouped.length && hasAny ? (
        <div className="sponsors-tier">
          <div className="sponsors-grid">
            {list.map((s) => (
              <SponsorCard key={s.id} sponsor={s} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
