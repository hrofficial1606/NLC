import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { eventApi, galleryApi, memberApi } from "../../api";

function formatEventDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

export default function HomePage() {
  const [upcoming, setUpcoming] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [upcomingRes, galleryRes, membersRes] = await Promise.allSettled([
          eventApi.getUpcomingEvent(),
          galleryApi.listPublicGallery({ page: 0, size: 6 }),
          memberApi.getTeamMembers(),
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
      } catch {
        // ignore — optional homepage data
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="page page--home">
      <section className="hero">
        <div className="container">
          <h1>Nagpur Ladies Club</h1>
          <p>Celebrations • Connection • Empowerment</p>
          <div className="hero__cta">
            <Link to="/events" className="btn btn-primary">Browse events</Link>
            <Link to="/register" className="btn btn-outline">Join NLC</Link>
          </div>
        </div>
      </section>

      {upcoming ? (
        <section className="home-upcoming">
          <div className="container">
            <h2>Next event</h2>
            <article className="home-upcoming__card">
              {upcoming.bannerImageUrl ? <img src={upcoming.bannerImageUrl} alt={upcoming.title} /> : null}
              <div className="home-upcoming__body">
                <h3>{upcoming.title}</h3>
                <p>{formatEventDate(upcoming.eventDate)} • {upcoming.location}</p>
                {upcoming.shortDescription ? <p>{upcoming.shortDescription}</p> : null}
                <Link to={`/events/${upcoming.id}`} className="btn btn-primary">View details</Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section className="home-gallery">
          <div className="container">
            <h2>From our events</h2>
            <div className="home-gallery__grid">
              {gallery.map((g) => (
                <div key={g.id} className="home-gallery__tile">
                  <img src={g.thumbnailUrl || g.mediaUrl} alt={g.title || "Gallery"} loading="lazy" />
                </div>
              ))}
            </div>
            <Link to="/gallery" className="btn btn-outline">See full gallery</Link>
          </div>
        </section>
      ) : null}

      {members.length > 0 ? (
        <section className="home-team">
          <div className="container">
            <h2>Meet the team</h2>
            <div className="home-team__grid">
              {members.map((m) => (
                <article key={m.id} className="home-team__card">
                  {m.imageUrl ? <img src={m.imageUrl} alt={m.name} /> : <div className="home-team__placeholder" />}
                  <h3>{m.name}</h3>
                  <p className="muted">{m.designation}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
