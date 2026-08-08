import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { contentApi } from "../../api";
import SponsorsTiers from "./SponsorsTiers";

// Sponsor logos pulled from the Sponsers reference folder. These display alongside
// (not in place of) the backend sponsor data — admin-managed sponsors continue
// to drive the tiered section above.
const SPONSOR_LOGOS = [
  { id: "logo-01", src: "/images/sponsors/sponsor-logo-01.png", alt: "NLC sponsor logo 1", caption: "Trusted Partner" },
  { id: "logo-02", src: "/images/sponsors/sponsor-logo-02.png", alt: "NLC sponsor logo 2", caption: "Trusted Partner" },
  { id: "logo-03", src: "/images/sponsors/sponsor-logo-03.png", alt: "NLC sponsor logo 3", caption: "Trusted Partner" },
  { id: "logo-04", src: "/images/sponsors/sponsor-logo-04.png", alt: "NLC sponsor logo 4", caption: "Trusted Partner" },
  { id: "logo-05", src: "/images/sponsors/sponsor-logo-05.png", alt: "NLC sponsor logo 5", caption: "Trusted Partner" },
  { id: "logo-06", src: "/images/sponsors/sponsor-logo-06.png", alt: "NLC sponsor logo 6", caption: "Trusted Partner" },
  { id: "logo-07", src: "/images/sponsors/sponsor-logo-07.png", alt: "NLC sponsor logo 7", caption: "Trusted Partner" },
  { id: "logo-08", src: "/images/sponsors/sponsor-logo-08.png", alt: "NLC sponsor logo 8", caption: "Trusted Partner" },
  { id: "logo-09", src: "/images/sponsors/sponsor-logo-09.png", alt: "NLC sponsor logo 9", caption: "Trusted Partner" },
  { id: "logo-10", src: "/images/sponsors/sponsor-logo-10.png", alt: "NLC sponsor logo 10", caption: "Trusted Partner" },
  { id: "logo-11", src: "/images/sponsors/sponsor-logo-11.png", alt: "NLC sponsor logo 11", caption: "Trusted Partner" },
  { id: "logo-12", src: "/images/sponsors/sponsor-logo-12.png", alt: "NLC sponsor logo 12", caption: "Trusted Partner" },
  { id: "logo-13", src: "/images/sponsors/sponsor-logo-13.png", alt: "NLC sponsor logo 13", caption: "Trusted Partner" },
  { id: "logo-14", src: "/images/sponsors/sponsor-logo-14.png", alt: "NLC sponsor logo 14", caption: "Trusted Partner" },
  { id: "logo-15", src: "/images/sponsors/sponsor-logo-15.png", alt: "NLC sponsor logo 15", caption: "Trusted Partner" },
  { id: "logo-16", src: "/images/sponsors/sponsor-logo-16.png", alt: "NLC sponsor logo 16", caption: "Trusted Partner" },
  { id: "logo-17", src: "/images/sponsors/sponsor-logo-17.png", alt: "NLC sponsor logo 17", caption: "Trusted Partner" },
  { id: "logo-18", src: "/images/sponsors/sponsor-logo-18.png", alt: "NLC sponsor logo 18", caption: "Trusted Partner" },
  { id: "logo-19", src: "/images/sponsors/sponsor-logo-19.png", alt: "NLC sponsor logo 19", caption: "Trusted Partner" },
  { id: "logo-20", src: "/images/sponsors/sponsor-logo-20.png", alt: "NLC sponsor logo 20", caption: "Trusted Partner" },
  { id: "logo-21", src: "/images/sponsors/sponsor-logo-21.png", alt: "NLC sponsor logo 21", caption: "Trusted Partner" },
  { id: "logo-22", src: "/images/sponsors/sponsor-logo-22.png", alt: "NLC sponsor logo 22", caption: "Trusted Partner" },
  { id: "logo-23", src: "/images/sponsors/sponsor-logo-23.png", alt: "NLC sponsor logo 23", caption: "Trusted Partner" },
  { id: "logo-24", src: "/images/sponsors/sponsor-logo-24.png", alt: "NLC sponsor logo 24", caption: "Trusted Partner" },
  { id: "logo-25", src: "/images/sponsors/sponsor-logo-25.png", alt: "NLC sponsor logo 25", caption: "Trusted Partner" },
  { id: "logo-26", src: "/images/sponsors/sponsor-logo-26.png", alt: "NLC sponsor logo 26", caption: "Trusted Partner" },
  { id: "logo-27", src: "/images/sponsors/sponsor-logo-27.png", alt: "NLC sponsor logo 27", caption: "Trusted Partner" },
];

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await contentApi.getSponsors();
        if (mounted) {
          const list = Array.isArray(data) ? data : [];
          // Honour the admin-set display order; only show active sponsors on the public page.
          setSponsors(
            list
              .filter((s) => s.active !== false)
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          );
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load sponsors");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const hasSponsors = sponsors.length > 0;

  return (
    <main className="sponsors-page">
      {/* HERO */}
      <section className="sponsors-hero sponsors-hero--poster">
        <div className="container">
          <p className="sponsors-hero__eyebrow">Trusted partners</p>
          <h1>Our Sponsors</h1>
          <p>
            We&apos;re grateful to the brands and partners who walk alongside Nagpur Ladies Club —
            supporting our community, our events, and our women.
          </p>
        </div>
      </section>

      {/* TIERS */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Partnerships</p>
            <h2 className="section__title">Brands that walk with us</h2>
            <p className="section__subtitle">
              Each partner adds their own warmth to our community. Together, we celebrate more
              beautifully.
            </p>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {loading ? <p className="page-loading">Loading sponsors…</p> : null}

          {!loading && !error && !hasSponsors ? (
            <div className="empty-card">
              <span className="empty-card__mark">Sponsors</span>
              <h3>Interested in partnering with us?</h3>
              <p>
                Our circle of trusted partners is growing. If your brand would like to walk
                alongside NLC and support our women-led community, we&apos;d love to hear from you.
              </p>
              <Link to="/register" className="btn btn-outline">Get in touch</Link>
            </div>
          ) : null}

          {hasSponsors ? <SponsorsTiers sponsors={sponsors} /> : null}
        </div>
      </section>

      {/* FEATURED SPONSOR LOGOS — Sponsers reference folder assets displayed as a showcase */}
      <section className="section sponsors-logos">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Featured logos</p>
            <h2 className="section__title">Logos from our partners</h2>
            <p className="section__subtitle">
              A glimpse of the partner artwork featured across our NLC design system.
            </p>
          </div>
          <div className="sponsors-logos__grid">
            {SPONSOR_LOGOS.map((logo) => (
              <figure key={logo.id} className="sponsors-logo-card">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                />
                <figcaption>{logo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" aria-hidden="true">
        <span className="divider__line" />
        <span className="divider__star">✦</span>
        <span className="divider__line" />
      </div>

      {/* CTA */}
      <section className="sponsors-cta">
        <div className="container">
          <div className="sponsors-cta__inner">
            <p className="sponsors-cta__eyebrow">Partner with us</p>
            <h2>Become a Nagpur Ladies Club partner</h2>
            <p>
              From event visibility to brand collaborations — partner with a premium women-led
              community in Nagpur and grow with us.
            </p>
            <div className="sponsors-cta__buttons">
              <Link to="/membership" className="btn btn-primary btn-script">Explore collaboration</Link>
              <Link to="/register" className="btn btn-outline btn-script">Get in touch</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
