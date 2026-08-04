import { useEffect, useState } from "react";
import { contentApi } from "../../api";

const empty = { name: "", logoUrl: "", websiteUrl: "", tier: "BRONZE", active: true, displayOrder: 0 };

export default function AdminSponsorsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await contentApi.listAdminSponsors();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load sponsors");
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
      const v = e.target.type === "checkbox" ? e.target.checked : e.target.type === "number" ? Number(e.target.value) : e.target.value;
      setForm((f) => ({ ...f, [field]: v }));
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing === "new") {
        await contentApi.createSponsor(form);
      } else {
        await contentApi.updateSponsor(editing, form);
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
    if (!window.confirm(`Delete sponsor "${item.name}"?`)) return;
    try {
      await contentApi.deleteSponsor(item.id);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <h1>Sponsors</h1>
        <button type="button" className="btn btn-primary" onClick={startCreate}>+ Add sponsor</button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state"><p>No sponsors yet.</p></div>
      ) : null}

      {items.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Tier</th>
              <th>Website</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.tier}</td>
                <td>{s.websiteUrl ? <a href={s.websiteUrl} target="_blank" rel="noreferrer noopener">{s.websiteUrl}</a> : "—"}</td>
                <td className="admin-table__actions">
                  <button type="button" className="btn btn-outline" onClick={() => startEdit(s)}>Edit</button>
                  <button type="button" className="btn btn-danger" onClick={() => remove(s)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {editing ? (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing === "new" ? "Add sponsor" : "Edit sponsor"}</h2>
            <form onSubmit={save} className="admin-form">
              <label>Name<input value={form.name} onChange={update("name")} required /></label>
              <label>Logo URL<input value={form.logoUrl} onChange={update("logoUrl")} /></label>
              <label>Website URL<input value={form.websiteUrl} onChange={update("websiteUrl")} /></label>
              <div className="admin-form__row">
                <label>Tier
                  <select value={form.tier} onChange={update("tier")}>
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="BRONZE">Bronze</option>
                  </select>
                </label>
                <label>Display order<input type="number" value={form.displayOrder} onChange={update("displayOrder")} /></label>
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
