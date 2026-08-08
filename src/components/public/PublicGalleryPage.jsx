import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { galleryApi } from "../../api";
import { fallbackItems } from "./galleryLocal";

export default function PublicGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await galleryApi.listPublicGallery({ page: 0, size: 24 });
        const list = data?.content || (Array.isArray(data) ? data : []);
        if (mounted) setItems(list);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load gallery");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // When the backend has no items, fall back to the static /images/gallery set
  // so the public gallery page is never blank.
  const displayItems = items.length > 0 ? items : fallbackItems;

  return (
    <main className="page gallery-page">
      <div className="container">
        <header className="page-header">
          <p className="page-header__eyebrow">Moments</p>
          <h1>Gallery</h1>
          <p>
            Beautiful moments from our recent events, gatherings, and celebrations. Click any
            photo to view it larger.
          </p>
        </header>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {loading ? <p className="page-loading">Loading gallery…</p> : null}

        {!loading && items.length === 0 && fallbackItems.length === 0 ? (
          <div className="empty-card">
            <span className="empty-card__mark">Gallery</span>
            <h3>Our gallery is growing</h3>
            <p>
              Beautiful moments from our community will appear here soon. Every event adds another
              story to our shared album.
            </p>
            <Link to="/events" className="btn btn-outline">Browse events</Link>
          </div>
        ) : null}

        {!loading && displayItems.length > 0 ? (
          <div className="gallery-masonry">
            {displayItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="gallery-tile"
                onClick={() => setSelected(item)}
                aria-label={item.title || "Gallery image"}
              >
                {item.thumbnailUrl || item.mediaUrl ? (
                  <img src={item.thumbnailUrl || item.mediaUrl} alt={item.title || "Gallery image"} loading="lazy" />
                ) : (
                  <div className="gallery-tile__placeholder" aria-hidden="true" />
                )}
                {item.title ? (
                  <div className="gallery-tile__caption">
                    <strong>{item.title}</strong>
                    {item.category ? <small>{item.category}</small> : null}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selected ? (
        <div
          className="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            className="lightbox__close"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); setSelected(null); }}
          >
            ✕
          </button>
          <div className="lightbox" onClick={(e) => e.stopPropagation()}>
            {(selected.mediaUrl || selected.thumbnailUrl) ? (
              <img src={selected.mediaUrl || selected.thumbnailUrl} alt={selected.title} />
            ) : null}
            {(selected.title || selected.category) ? (
              <div className="lightbox__body">
                {selected.title ? <h3>{selected.title}</h3> : null}
                {selected.category ? <p className="muted">{selected.category}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
