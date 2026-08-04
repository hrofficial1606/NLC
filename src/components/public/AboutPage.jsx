import { useEffect, useState } from "react";
import { contentApi, memberApi } from "../../api";

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
        const [c, m] = await Promise.all([
          contentApi.getAboutContent(),
          memberApi.getTeamMembers(),
        ]);
        if (mounted) {
          setContent(Array.isArray(c) ? c : []);
          setMembers(Array.isArray(m) ? m : []);
        }
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

  return (
    <main className="page page--about">
      <div className="container">
        <header className="page-header">
          <h1>About NLC</h1>
          <p>Learn about Nagpur Ladies Club and the team behind it.</p>
        </header>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {loading ? <p className="page-loading">Loading…</p> : null}

        {!loading && content.length === 0 && members.length === 0 ? (
          <div className="empty-state"><p>About content is being prepared.</p></div>
        ) : null}

        {content.length > 0 ? (
          <section className="about-content">
            {content.map((c) => (
              <article key={c.id} className="about-content__block">
                <h2>{c.title || c.sectionKey}</h2>
                {c.imageUrl ? <img src={c.imageUrl} alt={c.title || ""} /> : null}
                <p>{c.content}</p>
              </article>
            ))}
          </section>
        ) : null}

        {members.length > 0 ? (
          <section className="about-team">
            <h2>Our Team</h2>
            <div className="about-team__grid">
              {members.map((m) => (
                <article key={m.id} className="about-team__card">
                  {m.imageUrl ? <img src={m.imageUrl} alt={m.name} /> : <div className="about-team__placeholder" />}
                  <h3>{m.name}</h3>
                  <p className="muted">{m.designation}</p>
                  {m.bio ? <p>{m.bio}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
