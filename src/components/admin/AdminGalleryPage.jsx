import { useEffect, useState } from "react";
import { galleryApi } from "../../api";

const empty = { title: "", category: "", mediaUrl: "", thumbnailUrl: "", mediaType: "IMAGE", sourceType: "UPLOAD", active: true };

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await galleryApi.listAdminGallery({ page: 0, size: 50 });
      const list = data?.content || (Array.isArray(data) ? data : []);
      setItems(list);
    } catch (err) {
      setError(err.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing("new");
    setForm({ ...empty });
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({ ...empty, ...item });
  }

  function update(field) {
    return (e) => {
      const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: v }));
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing === "new") {
        await galleryApi.createGalleryItem(form);
      } else {
        await galleryApi.updateGalleryItem(editing, form);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete gallery item "${item.title}"?`)) return;
    try {
      await galleryApi.deleteGalleryItem(item.id);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <h1>Gallery</h1>
        <button type="button" className="btn btn-primary" onClick={startCreate}>+ Add image</button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state"><p>No gallery images yet.</p></div>
      ) : null}

      <div className="gallery-admin-grid">
        {items.map((item) => (
          <article key={item.id} className="gallery-admin-card">
            <div className="gallery-admin-card__media">
              {item.thumbnailUrl || item.mediaUrl ? (
                <img src={item.thumbnailUrl || item.mediaUrl} alt={item.title} loading="lazy" />
              ) : (
                <div className="gallery-admin-card__placeholder" />
              )}
            </div>
            <div className="gallery-admin-card__body">
              <h3>{item.title || "Untitled"}</h3>
              <p className="muted">{item.category || "—"}</p>
              <div className="gallery-admin-card__actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(item)}>Edit</button>
                <button type="button" className="btn btn-danger" onClick={() => remove(item)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing === "new" ? "Add gallery item" : "Edit gallery item"}</h2>
            <form onSubmit={save} className="admin-form">
              <label>Title<input value={form.title} onChange={update("title")} required /></label>
              <label>Category<input value={form.category} onChange={update("category")} /></label>
              <label>Media URL<input value={form.mediaUrl} onChange={update("mediaUrl")} required /></label>
              <label>Thumbnail URL<input value={form.thumbnailUrl} onChange={update("thumbnailUrl")} /></label>
              <div className="admin-form__row">
                <label>Type
                  <select value={form.mediaType} onChange={update("mediaType")}>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </label>
                <label>Source
                  <select value={form.sourceType} onChange={update("sourceType")}>
                    <option value="UPLOAD">Upload</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="EXTERNAL">External</option>
                  </select>
                </label>
              </div>
              <label className="check"><input type="checkbox" checked={form.active} onChange={update("active")} /> Active</label>
              <div className="admin-form__actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
