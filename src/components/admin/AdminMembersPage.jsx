import { useEffect, useState } from "react";
import { memberApi } from "../../api";

const empty = { name: "", designation: "", bio: "", imageUrl: "", instagramUrl: "", facebookUrl: "", linkedinUrl: "", displayOrder: 0 };

export default function AdminMembersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await memberApi.listAdminTeam();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load members");
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
      const v = e.target.type === "number" ? Number(e.target.value) : e.target.value;
      setForm((f) => ({ ...f, [field]: v }));
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, displayOrder: Number(form.displayOrder || 0) };
      if (editing === "new") {
        await memberApi.createTeamMember(payload);
      } else {
        await memberApi.updateTeamMember(editing, payload);
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
    if (!window.confirm(`Delete member "${item.name}"?`)) return;
    try {
      await memberApi.deleteTeamMember(item.id);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <h1>Members</h1>
        <button type="button" className="btn btn-primary" onClick={startCreate}>+ Add member</button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state"><p>No team members yet.</p></div>
      ) : null}

      <div className="members-admin-grid">
        {items.map((m) => (
          <article key={m.id} className="member-admin-card">
            <div className="member-admin-card__photo">
              {m.imageUrl ? <img src={m.imageUrl} alt={m.name} /> : <div className="member-admin-card__placeholder" />}
            </div>
            <div className="member-admin-card__body">
              <h3>{m.name}</h3>
              <p className="muted">{m.designation}</p>
              <div className="member-admin-card__actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(m)}>Edit</button>
                <button type="button" className="btn btn-danger" onClick={() => remove(m)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing === "new" ? "Add member" : "Edit member"}</h2>
            <form onSubmit={save} className="admin-form">
              <label>Name<input value={form.name} onChange={update("name")} required /></label>
              <label>Designation<input value={form.designation} onChange={update("designation")} required /></label>
              <label>Image URL<input value={form.imageUrl} onChange={update("imageUrl")} /></label>
              <label>Bio<textarea rows={3} value={form.bio} onChange={update("bio")} /></label>
              <div className="admin-form__row">
                <label>Instagram<input value={form.instagramUrl} onChange={update("instagramUrl")} /></label>
                <label>Facebook<input value={form.facebookUrl} onChange={update("facebookUrl")} /></label>
              </div>
              <div className="admin-form__row">
                <label>LinkedIn<input value={form.linkedinUrl} onChange={update("linkedinUrl")} /></label>
                <label>Display order<input type="number" value={form.displayOrder} onChange={update("displayOrder")} /></label>
              </div>
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
