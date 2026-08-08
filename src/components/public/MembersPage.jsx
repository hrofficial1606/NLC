import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { memberApi } from "../../api";
import MemberCard from "./MemberCard";
import { galleryImageUrls } from "./galleryLocal";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await memberApi.getTeamMembers();
        if (mounted) {
          setMembers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load members");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const hasMembers = members.length > 0;

  return (
    <main className="members-page">
      {/* HERO — uses the Figma members poster as backdrop */}
      <section className="members-hero members-hero--poster">
        <div className="container">
          <p className="members-hero__eyebrow">Our community</p>
          <h1>Meet Our Community</h1>
          <p>
            The women behind Nagpur Ladies Club — a circle of founders, members, and friends who
            make every celebration meaningful.
          </p>
          <figure className="members-poster" aria-hidden="true">
            <img
              src="/images/members/members-hero-poster.webp"
              alt=""
              loading="eager"
              onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
            />
          </figure>
        </div>
      </section>

      {/* MEMBERS POSTER / INTRO */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Members</p>
            <h2 className="section__title">The women who make NLC special</h2>
            <p className="section__subtitle">
              Every member brings her own story, warmth, and grace to our community.
            </p>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {loading ? <p className="page-loading">Loading members…</p> : null}

          {!loading && !error && !hasMembers ? (
            <div className="empty-card">
              <span className="empty-card__mark">Members</span>
              <h3>Meet the women who make our community special</h3>
              <p>
                Our member circle is growing. Soon, you&apos;ll see the inspiring women of NLC
                featured here — each one adding her own warmth to our story.
              </p>
              <Link to="/membership" className="btn btn-outline">Become a member</Link>
            </div>
          ) : null}

          {hasMembers ? (
            <div className="members-grid">
              {members.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* MEMBERS BANNER — Figma member photos arranged as a poster grid */}
      <section className="section members-banners">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Our circle</p>
            <h2 className="section__title">The faces of NLC</h2>
            <p className="section__subtitle">
              A glimpse of the women who bring NLC to life — each one adding her own warmth to our
              story.
            </p>
          </div>
          <div className="members-banners__grid">
            {galleryImageUrls.slice(0, 16).map((src, i) => (
              <figure
                key={src}
                className="members-banner"
                style={{ "--banner-index": i }}
              >
                <img
                  src={src}
                  alt={`NLC member portrait ${i + 1}`}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* SISTERHOOD QUOTE — pulled from the Figma frame */}
      <section className="section">
        <div className="container">
          <div className="members-quote">
            <span className="members-quote__mark" aria-hidden="true">✦</span>
            <p className="members-quote__text">
              &ldquo;More than a club, it&apos;s a sisterhood.&rdquo;
            </p>
            <p className="members-quote__attribution">— The NLC Community</p>
          </div>
        </div>
      </section>

      <div className="divider" aria-hidden="true">
        <span className="divider__line" />
        <span className="divider__star">✦</span>
        <span className="divider__line" />
      </div>

      {/* CTA */}
      <section className="members-cta">
        <div className="container">
          <div className="members-cta__inner">
            <p className="members-cta__eyebrow">Join the circle</p>
            <h2>Become part of our story</h2>
            <p>
              Membership is a warm invitation into a community of women who celebrate, connect, and
              empower each other — beautifully and intentionally.
            </p>
            <div className="members-cta__buttons">
              <Link to="/membership" className="btn btn-primary btn-script">Explore membership</Link>
              <Link to="/register" className="btn btn-outline btn-script">Apply today</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
