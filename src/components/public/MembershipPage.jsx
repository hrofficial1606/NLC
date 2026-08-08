import { Link } from "react-router-dom";

const PLANS = [
  {
    key: "elite",
    title: "Elite Membership",
    benefits: [
      "Priority access to all signature events",
      "Member-only gatherings every quarter",
      "Premium workshops & masterclasses",
      "Curated networking circles",
      "Discounts with partner brands",
    ],
    cta: "Apply for Elite",
  },
  {
    key: "gold",
    title: "Gold Membership",
    benefits: [
      "Access to all signature events",
      "Invitations to seasonal celebrations",
      "Members-only WhatsApp community",
      "Discounts with select partners",
      "Member magazine & updates",
    ],
    cta: "Apply for Gold",
  },
];

const BENEFITS = [
  {
    icon: "🎉",
    title: "Signature Events",
    body: "Be first to know about every celebration — from cultural evenings to lifestyle showcases.",
  },
  {
    icon: "🤝",
    title: "Lasting Friendships",
    body: "Meet women across Nagpur who share your warmth, ambition, and curiosity.",
  },
  {
    icon: "🌟",
    title: "Growth Workshops",
    body: "Hands-on sessions on creativity, wellness, business, and personal development.",
  },
  {
    icon: "🎁",
    title: "Member Perks",
    body: "Curated discounts and exclusive invitations from brands we love.",
  },
  {
    icon: "📰",
    title: "Member Stories",
    body: "Member magazine featuring member interviews, recipes, and lifestyle stories.",
  },
  {
    icon: "💗",
    title: "A Circle of Support",
    body: "A safe, warm community that is with you through every milestone and moment.",
  },
];

export default function MembershipPage() {
  return (
    <main className="membership-page">
      {/* HERO */}
      <section className="membership-hero">
        <div className="container membership-hero__inner">
          <div className="membership-hero__visual">
            <div className="membership-hero__visual-frame">
              <img
                src="/images/membership/Rectangle 58.png"
                alt="Nagpur Ladies Club"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>
          <div className="membership-hero__copy">
            <p className="membership-hero__eyebrow">Become a member</p>
            <h1>Step Into Your Community, Where You Truly Belong</h1>
            <p>
              Nagpur Ladies Club is more than a circle — it&apos;s a sisterhood of women who choose to
              celebrate life together. Find the membership that feels right for you.
            </p>
            <div className="membership-hero__cta">
              <Link to="/register" className="btn btn-primary btn-script">Apply now</Link>
              <Link to="/events" className="btn btn-ghost btn-script">See events</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="membership-plans">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Membership plans</p>
            <h2 className="section__title">Choose your circle</h2>
            <p className="section__subtitle">
              Both plans open the door to our signature events, member gatherings, and community.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {PLANS.map((plan) => (
              <article
                key={plan.key}
                className={`plan-card plan-card--${plan.key}`}
              >
                <span className="plan-card__stars plan-card__stars--left" aria-hidden="true">
                  <span>✦</span>
                </span>
                <span className="plan-card__stars plan-card__stars--right" aria-hidden="true">
                  <span>✦</span>
                </span>
                <div>
                  <div className="plan-card__head">
                    <h3 className="plan-card__title">{plan.title}</h3>
                  </div>
                  <ul className="plan-card__list">
                    {plan.benefits.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Link to="/register" className="btn btn-ghost btn-script plan-card__cta">
                    {plan.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="membership-benefits">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">What you get</p>
            <h2 className="section__title">A community designed for the woman you are</h2>
            <p className="section__subtitle">
              Every membership unlocks warm hospitality, beautiful events, and meaningful moments.
            </p>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map((b) => (
              <article key={b.title} className="benefit-card">
                <div className="benefit-card__icon" aria-hidden="true">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="membership-cta">
        <div className="container">
          <div className="membership-cta__inner">
            <p className="membership-cta__eyebrow">Apply today</p>
            <h2>Begin your NLC journey</h2>
            <p>
              Become part of Nagpur&apos;s most inspiring women&apos;s community. The application is
              simple — and we can&apos;t wait to welcome you.
            </p>
            <Link to="/register" className="btn btn-primary btn-script">Apply for membership</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
