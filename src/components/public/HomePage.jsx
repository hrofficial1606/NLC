import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { eventApi, galleryApi, memberApi, contentApi } from "../../api";

function formatEventDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

const PILLARS = [
  {
    title: "Women",
    script: "Women",
    body: "A circle of inspiring women who lift each other up through every milestone and moment.",
  },
  {
    title: "Community",
    script: "Community",
    body: "Genuine friendships and meaningful connections that go beyond the events themselves.",
  },
  {
    title: "Friendship",
    script: "Friendship",
    body: "Warm, welcoming gatherings where every new face quickly feels like an old friend.",
  },
  {
    title: "Empowerment",
    script: "Empowerment",
    body: "Workshops, conversations, and opportunities that help every woman grow with confidence.",
  },
];

const WHY_JOIN = [
  {
    title: "Signature Events",
    body: "Curated cultural, lifestyle, and learning events hosted throughout the year.",
  },
  {
    title: "Lasting Friendships",
    body: "Meet women across professions, ages, and interests who become part of your circle.",
  },
  {
    title: "Growth & Culture",
    body: "Workshops, conversations, and celebrations that nurture who you are becoming.",
  },
];

const TESTIMONIALS = [];

export default function HomePage() {
  const [upcoming, setUpcoming] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [members, setMembers] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [upcomingRes, galleryRes, membersRes, sponsorsRes] = await Promise.allSettled([
          eventApi.getUpcomingEvent(),
          galleryApi.listPublicGallery({ page: 0, size: 9 }),
          memberApi.getTeamMembers(),
          contentApi.getSponsors(),
        ]);
        if (!mounted) return;
        if (upcomingRes.status === "fulfilled") setUpcoming(upcomingRes.value);
        if (galleryRes.status === "fulfilled") {
          const list = galleryRes.value?.content || (Array.isArray(galleryRes.value) ? galleryRes.value : []);
          setGallery(list);
        }
        if (membersRes.status === "fulfilled") {
          const list = Array.isArray(membersRes.value) ? membersRes.value : [];
          setMembers(list.slice(0, 4));
        }
        if (sponsorsRes.status === "fulfilled") {
          const list = Array.isArray(sponsorsRes.value) ? sponsorsRes.value : [];
          setSponsors(list.filter((s) => s.active !== false).slice(0, 6));
        }
      } catch {
        // ignore — optional homepage data
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const galleryTiles = gallery.slice(0, 8);
  const hasGallery = galleryTiles.length > 0;

  return (
    <main className="page page--home">
      {/* HERO */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="hero__eyebrow">Welcome to</p>
            <h1 className="hero__title">
              Celebrate. Connect. <em>Empower.</em>
            </h1>
            <p className="hero__subtitle">
              A premium women&apos;s community in Nagpur where friendships blossom, culture is
              celebrated, and every woman is invited to shine.
            </p>
            <div className="hero__cta">
              <Link to="/events" className="btn btn-primary btn-script">Browse Events</Link>
              <Link to="/register" className="btn btn-ghost btn-script">Join the Club</Link>
            </div>
          </div>
          <div className="hero__visual">
            <span className="hero__stars hero__stars--tl" aria-hidden="true">✦</span>
            <span className="hero__stars hero__stars--br" aria-hidden="true">✦</span>
            <div className="hero__visual-frame">
              <img
                src="/images/hero-logo.png"
                alt="Nagpur Ladies Club"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE STAND FOR */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">What we stand for</p>
            <h2 className="section__title">A circle of women who celebrate, connect &amp; empower</h2>
            <p className="section__subtitle">
              NLC is built on the values that make our community warm, modern, and meaningful.
            </p>
          </div>
          <div className="pillars">
            {PILLARS.map((p, idx) => (
              <article
                key={p.title}
                className={`pillar-card ${idx % 2 === 0 ? "pillar-card--alt" : "pillar-card--lavender"}`}
              >
                <p className="pillar-card__script">{p.script}</p>
                <h3 className="pillar-card__title">{p.title}</h3>
                <p className="pillar-card__body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENT */}
      <section className="home-upcoming">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Mark your calendar</p>
            <h2 className="section__title">Upcoming celebration</h2>
            <p className="section__subtitle">
              Be the first to know about our next signature gathering.
            </p>
          </div>
          {upcoming ? (
            <article className="home-upcoming__card">
              <div className="home-upcoming__media">
                {upcoming.bannerImageUrl ? (
                  <img src={upcoming.bannerImageUrl} alt={upcoming.title} />
                ) : (
                  <div className="home-upcoming__placeholder">✦</div>
                )}
              </div>
              <div className="home-upcoming__body">
                <p className="home-upcoming__eyebrow">Next event</p>
                <h3>{upcoming.title}</h3>
                <p className="home-upcoming__meta">
                  <span>📅 {formatEventDate(upcoming.eventDate)}</span>
                  <span>📍 {upcoming.location}</span>
                </p>
                {upcoming.shortDescription ? <p>{upcoming.shortDescription}</p> : null}
                <div className="home-upcoming__cta">
                  <Link to={`/events/${upcoming.id}`} className="btn btn-primary">View details</Link>
                  <Link to="/events" className="btn btn-outline">All events</Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="home-upcoming__empty">
              <span className="home-upcoming__empty-mark">Coming soon</span>
              <h3>Something exciting is on its way</h3>
              <p>
                Our community team is putting together the next unforgettable celebration.
                Stay connected — beautiful things are coming.
              </p>
              <Link to="/events" className="btn btn-outline">See past celebrations</Link>
            </div>
          )}
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="home-gallery">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Glimpses of NLC</p>
            <h2 className="section__title">Moments from our celebrations</h2>
            <p className="section__subtitle">
              A peek into the laughter, music, and colour of every NLC gathering.
            </p>
          </div>
          {hasGallery ? (
            <>
              <div className="home-gallery__grid">
                {galleryTiles.map((g, idx) => (
                  <Link
                    key={g.id}
                    to="/gallery"
                    className={`home-gallery__tile ${idx === 0 ? "home-gallery__tile--big" : ""}`}
                    aria-label={g.title || "Gallery image"}
                  >
                    <img src={g.thumbnailUrl || g.mediaUrl} alt={g.title || "Gallery"} loading="lazy" />
                  </Link>
                ))}
              </div>
              <div className="home-gallery__cta">
                <Link to="/gallery" className="btn btn-outline">See full gallery</Link>
              </div>
            </>
          ) : (
            <div className="empty-card">
              <span className="empty-card__mark">Gallery</span>
              <h3>Our gallery is growing</h3>
              <p>
                Beautiful moments from our community will appear here soon. Check back as we capture
                every celebration.
              </p>
              <Link to="/gallery" className="btn btn-outline">Visit gallery</Link>
            </div>
          )}
        </div>
      </section>

      {/* WHY JOIN */}
      <section className="why-join">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Why join us</p>
            <h2 className="section__title">A community designed for the woman you are</h2>
          </div>
          <div className="why-join__grid">
            {WHY_JOIN.map((card) => (
              <article key={card.title} className="why-card">
                <p className="why-card__script">✦</p>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERS + SPONSORS (compact) */}
      <section className="home-community">
        <div className="container">
          <div className="home-community__grid">
            <div className="home-community__col">
              <p className="section__eyebrow">Meet Our Community</p>
              <h2 className="section__title">Members</h2>
              <p className="section__subtitle">
                The women who make our circle warm, beautiful, and inspiring.
              </p>
              {members.length > 0 ? (
                <div className="home-community__avatars">
                  {members.slice(0, 4).map((m) => {
                    const photo = m.imageUrl || m.photoUrl;
                    return (
                      <div key={m.id} className="home-community__avatar">
                        {photo ? (
                          <img src={photo} alt={m.name ? `Portrait of ${m.name}` : "Member"} loading="lazy" />
                        ) : (
                          <span className="home-community__avatar-fallback" aria-hidden="true">
                            {(m.name || "?").split(/\s+/)[0]?.[0]?.toUpperCase() || "✦"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <Link to="/members" className="btn btn-outline">View All Members</Link>
            </div>

            <div className="home-community__col">
              <p className="section__eyebrow">Trusted Partners</p>
              <h2 className="section__title">Sponsors</h2>
              <p className="section__subtitle">
                The brands and partners who walk alongside Nagpur Ladies Club.
              </p>
              {sponsors.length > 0 ? (
                <div className="home-community__logos">
                  {sponsors.slice(0, 6).map((s) => (
                    <div key={s.id} className="home-community__logo">
                      {s.logoUrl ? (
                        <img src={s.logoUrl} alt={s.name ? `${s.name} logo` : "Sponsor logo"} loading="lazy" />
                      ) : (
                        <span className="home-community__logo-fallback" aria-hidden="true">
                          {s.name?.[0] || "✦"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
              <Link to="/sponsors" className="btn btn-outline">View All Sponsors</Link>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP TEASER */}
      <section className="home-upcoming">
        <div className="container">
          <div className="section__head">
            <p className="section__eyebrow">Become a member</p>
            <h2 className="section__title">Step into your community, where you truly belong</h2>
            <p className="section__subtitle">
              Membership unlocks signature events, member gatherings, and a beautiful circle of
              like-minded women.
            </p>
          </div>
          <div className="home-upcoming__cta" style={{ justifyContent: "center", display: "flex" }}>
            <Link to="/membership" className="btn btn-primary btn-script">Explore membership</Link>
            <Link to="/register" className="btn btn-outline btn-script">Apply today</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="container">
          <div className="testimonials__heading">
            <span className="testimonials__shadow">STORIES</span>
            <h2>Words from our members</h2>
          </div>
          {TESTIMONIALS.length === 0 ? (
            <div className="empty-card">
              <span className="empty-card__mark">Stories</span>
              <h3>More inspiring stories are coming soon</h3>
              <p>
                Our members share beautiful stories of friendship, growth, and celebration. Real
                voices from our community will appear here as our circle grows.
              </p>
              <Link to="/membership" className="btn btn-outline">Become a member</Link>
            </div>
          ) : (
            <div className="testimonials__grid">
              {TESTIMONIALS.map((t, idx) => (
                <article key={idx} className="testimonial-card">
                  <span className="testimonial-card__star" aria-hidden="true">★</span>
                  <p className="testimonial-card__quote">&ldquo;{t.quote}&rdquo;</p>
                  <p className="testimonial-card__author">{t.author}</p>
                  <p className="testimonial-card__role">{t.role}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="final-cta__inner">
            <p className="final-cta__eyebrow">Step in</p>
            <h2>Become part of Nagpur&apos;s most inspiring women&apos;s community</h2>
            <p>
              Join Nagpur Ladies Club and step into a circle where friendship, culture, and
              empowerment come together beautifully.
            </p>
            <div className="final-cta__buttons">
              <Link to="/register" className="btn btn-primary btn-script">Join the Club</Link>
              <Link to="/events" className="btn btn-ghost btn-script">See upcoming events</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
