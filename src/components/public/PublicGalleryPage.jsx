import { useEffect, useState } from "react";
import { galleryApi } from "../../api";

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

  return (
    <main className="page page--gallery">
      <div className="container">
        <header className="page-header">
          <h1>Gallery</h1>
          <p>Moments from our recent events and gatherings.</p>
        </header>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {loading ? <p className="page-loading">Loading gallery…</p> : null}

        {!loading && items.length === 0 ? (
          <div className="empty-state"><p>No gallery images yet.</p></div>
        ) : null}

        <div className="public-gallery-grid">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="public-gallery-card"
              onClick={() => setSelected(item)}
            >
              {item.thumbnailUrl || item.mediaUrl ? (
                <img src={item.thumbnailUrl || item.mediaUrl} alt={item.title || "Gallery image"} loading="lazy" />
              ) : (
                <div className="public-gallery-card__placeholder" />
              )}
              {item.title ? <span className="public-gallery-card__title">{item.title}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {(selected.mediaUrl || selected.thumbnailUrl) ? (
              <img src={selected.mediaUrl || selected.thumbnailUrl} alt={selected.title} />
            ) : null}
            {selected.title ? <h3>{selected.title}</h3> : null}
            {selected.category ? <p className="muted">{selected.category}</p> : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
