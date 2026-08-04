import { useEffect, useState } from "react";
import { contentApi } from "../../api";

const empty = { sectionKey: "", title: "", content: "", imageUrl: "", active: true };

export default function AdminContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await contentApi.listAdminAboutContent();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load content");
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
      await contentApi.saveAboutContent(form);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <h1>About Content</h1>
        <button type="button" className="btn btn-primary" onClick={startCreate}>+ Add section</button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state"><p>No about content sections yet.</p></div>
      ) : null}

      <div className="content-admin-list">
        {items.map((c) => (
          <article key={c.id} className="content-admin-card">
            <header>
              <h3>{c.title || c.sectionKey}</h3>
              <span className="muted">{c.sectionKey}</span>
            </header>
            <p>{c.content?.slice(0, 200)}{c.content && c.content.length > 200 ? "…" : ""}</p>
            <button type="button" className="btn btn-outline" onClick={() => startEdit(c)}>Edit</button>
          </article>
        ))}
      </div>

      {editing ? (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing === "new" ? "Add content section" : "Edit content section"}</h2>
            <form onSubmit={save} className="admin-form">
              <label>Section key<input value={form.sectionKey} onChange={update("sectionKey")} required maxLength={160} /></label>
              <label>Title<input value={form.title} onChange={update("title")} required maxLength={160} /></label>
              <label>Content<textarea rows={6} value={form.content} onChange={update("content")} required /></label>
              <label>Image URL<input value={form.imageUrl} onChange={update("imageUrl")} /></label>
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
