import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { contentApi, memberApi } from "../../api";

const OFFERS = [
  { icon: "🎉", title: "Signature Events", body: "Cultural, lifestyle, and learning celebrations curated for our community." },
  { icon: "🤝", title: "Member Network", body: "Genuine friendships and professional connections across Nagpur." },
  { icon: "🌱", title: "Workshops", body: "Hands-on sessions for creativity, wellness, business, and personal growth." },
  { icon: "✨", title: "Member Perks", body: "Curated discounts, exclusive invitations, and member-only experiences." },
];

const STATS = [
  { value: "✦", label: "A growing sisterhood" },
  { value: "✦", label: "Curated celebrations" },
  { value: "✦", label: "Lasting friendships" },
  { value: "✦", label: "Moments of joy" },
];

const WHY_BLOCKS = [
  { icon: "💗", title: "Warm & welcoming", body: "Every new member is greeted with warmth. Our community is built on kindness, not exclusivity." },
  { icon: "✨", title: "Premium experiences", body: "Beautifully designed events that feel like celebrations, not formalities." },
  { icon: "🌟", title: "Genuine connections", body: "Small-group gatherings that turn first meetings into lifelong friendships." },
  { icon: "🌱", title: "Growth for every woman", body: "Workshops, mentorship, and conversations that help you flourish." },
];

export default function AboutPage() {
  const [content, setContent] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [c, m] = await Promise.allSettled([
          contentApi.getAboutContent(),
          memberApi.getTeamMembers(),
        ]);
        if (!mounted) return;
        if (c.status === "fulfilled") setContent(Array.isArray(c.value) ? c.value : []);
        if (m.status === "fulfilled") setMembers(Array.isArray(m.value) ? m.value : []);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load About content");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Try to pull specific CMS blocks (vision / mission) if backend exposes them.
  const findBlock = (key) =>
    content.find((c) => (c.sectionKey || "").toLowerCase() === key.toLowerCase()) || null;
  const visionBlock = findBlock("vision");
  const missionBlock = findBlock("mission");
  const founderBlock = findBlock("founder");

  return (
    <main className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="container">
          <p className="about-hero__eyebrow">Our story</p>
          <h1>About Nagpur Ladies Club</h1>
          <p>
            A premium women&apos;s community celebrating culture, friendship, and empowerment —
            one beautiful gathering at a time.
          </p>
        </div>
      </section>

      {/* WELCOME */}
      <section className="about-welcome">
        <div className="container">
          <p className="about-welcome__eyebrow">Welcome to</p>
          <h2>Nagpur Ladies Club</h2>
          <p>
            We are a <span className="script">circle of inspiring women</span> who come together to
            celebrate life&apos;s special moments, support one another&apos;s dreams, and create lasting
            friendships. From signature cultural events to intimate workshops,
            <span className="accent"> NLC is where women flourish.</span>
          </p>
        </div>
      </section>

      <div className="divider" aria-hidden="true">
        <span className="divider__line" />
        <span className="divider__star">✦</span>
        <span className="divider__line" />
      </div>

      {/* VISION */}
      <section className="section">
        <div className="container">
          <div className="about-split">
            <div className="about-split__media">
              <div className="about-split__media-frame">
                <img
                  src="/images/about/Handshake.png"
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            </div>
            <div className="about-split__body">
              <h2>Our Vision</h2>
              {visionBlock ? (
                <p>{visionBlock.content}</p>
              ) : (
                <p>
                  To be Nagpur&apos;s most loved women&apos;s community — a space where every woman
                  feels seen, celebrated, and inspired to live her fullest life.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-split about-split--reverse">
            <div className="about-split__media">
              <div className="about-split__media-frame">
                <img
                  src="/images/about/Party.png"
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            </div>
            <div className="about-split__body">
              <h2>Our Mission</h2>
              {missionBlock ? (
                <p>{missionBlock.content}</p>
              ) : (
                <p>
                  To bring women together through meaningful events, warm hospitality, and
                  opportunities to learn, share, and grow — building friendships that last a lifetime.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      {(founderBlock || true) ? (
        <section className="about-founder">
          <div className="container">
            <div className="about-founder__inner">
              <div className="about-founder__photo-frame">
                <img
                  src="/images/image.png"
                  alt="Founder of Nagpur Ladies Club"
                  onError={(e) => { e.currentTarget.src = "/images/membership/Nagpur Ladies Club.png"; }}
                />
              </div>
              <div className="about-founder__copy">
                <h3>Founder&apos;s Note</h3>
                <p className="role">With love, from our founder</p>
                <p>
                  {founderBlock?.content ||
                    "NLC was born from a simple dream — to create a space where every woman in Nagpur feels she belongs. Today, that dream lives on through every smile, every gathering, and every friendship made here."}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* WHAT WE OFFER */}
      <section className="about-offers">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">What we offer</p>
            <h2 className="section__title">A community for every woman</h2>
          </div>
          <div className="about-offers__grid">
            {OFFERS.map((o) => (
              <article key={o.title} className="offer-card">
                <div className="offer-card__icon" aria-hidden="true">{o.icon}</div>
                <h3 className="offer-card__title">{o.title}</h3>
                <p className="offer-card__body">{o.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" aria-hidden="true">
        <span className="divider__line" />
        <span className="divider__star">✦</span>
        <span className="divider__line" />
      </div>

      {/* OUR COMMUNITY (stats) */}
      <section className="about-community">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Our community</p>
            <h2 className="section__title">A growing family across Nagpur</h2>
            <p className="section__subtitle">
              Every number reflects the warmth, dedication, and joy of our members.
            </p>
          </div>
          <div className="about-community__stats">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      {members.length > 0 ? (
        <section className="section">
          <div className="container">
            <div className="section__head">
              <p className="section__eyebrow">Meet the team</p>
              <h2 className="section__title">The women behind NLC</h2>
            </div>
            <div className="about-team-grid">
              {members.map((m) => (
                <article key={m.id} className="team-card">
                  <div className="team-card__photo">
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.name} />
                    ) : (
                      <div className="team-card__placeholder" aria-hidden="true">N</div>
                    )}
                  </div>
                  <h3>{m.name}</h3>
                  <p className="team-card__role">{m.designation}</p>
                  {m.bio ? <p className="team-card__bio">{m.bio}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* WHY JOIN */}
      <section className="about-why">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Why join us</p>
            <h2 className="section__title">Because you deserve a community like this</h2>
          </div>
          <div className="about-why__grid">
            {WHY_BLOCKS.map((b) => (
              <div key={b.title} className="why-block">
                <div className="why-block__icon" aria-hidden="true">{b.icon}</div>
                <div className="why-block__body">
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta__inner">
            <p className="section__eyebrow" style={{ color: "var(--color-pink-300)" }}>Step into your community</p>
            <h2>Ready to be part of something beautiful?</h2>
            <p>
              Join Nagpur Ladies Club today and step into a circle where you truly belong — filled
              with friendship, celebration, and meaningful moments.
            </p>
            <Link to="/register" className="btn btn-primary btn-script">Become a member</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
