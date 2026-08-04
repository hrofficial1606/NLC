import { useEffect, useState } from "react";
import { eventApi } from "../../api";

const emptyEvent = {
  title: "",
  slug: "",
  description: "",
  shortDescription: "",
  eventDate: "",
  location: "",
  ticketPrice: 0,
  totalSeats: 50,
  registrationEnabled: true,
  paidEvent: false,
  featured: false,
  available: true,
  bannerImageUrl: "",
  qrImageUrl: "",
  upiId: "",
  paymentInstructions: "",
  registrationDeadline: "",
  status: "UPCOMING",
};

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDateTimeInput(value) {
  if (!value) return "";
  // Convert ISO to "yyyy-MM-ddTHH:mm"
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDateTimeInput(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await eventApi.listAdminEvents({ page: 0, size: 50, search: search || undefined });
      const list = data?.content || (Array.isArray(data) ? data : []);
      setEvents(list);
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function startCreate() {
    setEditing("new");
    setForm({ ...emptyEvent, eventDate: toDateTimeInput(new Date(Date.now() + 7 * 86400000)) });
  }

  function startEdit(event) {
    setEditing(event.id);
    setForm({
      ...emptyEvent,
      ...event,
      ticketPrice: Number(event.ticketPrice || 0),
      totalSeats: Number(event.totalSeats || 0),
      eventDate: toDateTimeInput(event.eventDate),
      registrationDeadline: toDateTimeInput(event.registrationDeadline),
    });
  }

  function update(field) {
    return (e) => {
      const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: v, ...(field === "title" && !f.slug ? { slug: slugify(String(v)) } : {}) }));
    };
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        ticketPrice: Number(form.ticketPrice || 0),
        totalSeats: Number(form.totalSeats || 0),
        eventDate: fromDateTimeInput(form.eventDate),
        registrationDeadline: fromDateTimeInput(form.registrationDeadline),
      };
      if (editing === "new") {
        await eventApi.createEvent(payload);
      } else {
        await eventApi.updateEvent(editing, payload);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(event) {
    if (!window.confirm(`Delete event "${event.title}"? This cannot be undone.`)) return;
    try {
      await eventApi.deleteEvent(event.id);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <h1>Events</h1>
        <button type="button" className="btn btn-primary" onClick={startCreate}>+ New event</button>
      </header>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading events…</p> : null}

      {!loading && events.length === 0 ? (
        <div className="empty-state">
          <p>No events yet. Create your first event.</p>
        </div>
      ) : null}

      {events.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Type</th>
              <th>Seats</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{new Date(event.eventDate).toLocaleString()}</td>
                <td>{event.paidEvent ? `Paid (₹${event.ticketPrice})` : "Free"}</td>
                <td>{event.availableSeats ?? "—"} / {event.totalSeats ?? "—"}</td>
                <td>
                  <span className={`status-pill ${event.registrationEnabled ? "status-pill--approved" : "status-pill--rejected"}`}>
                    {event.registrationEnabled ? "Open" : "Closed"}
                  </span>
                </td>
                <td className="admin-table__actions">
                  <button type="button" className="btn btn-outline" onClick={() => startEdit(event)}>Edit</button>
                  <button type="button" className="btn btn-danger" onClick={() => remove(event)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {editing ? (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing === "new" ? "Create event" : "Edit event"}</h2>
            <form onSubmit={save} className="admin-form">
              <div className="admin-form__row">
                <label>Title<input value={form.title} onChange={update("title")} required maxLength={160} /></label>
                <label>Slug<input value={form.slug} onChange={update("slug")} required maxLength={300} /></label>
              </div>
              <label>Short description<input value={form.shortDescription} onChange={update("shortDescription")} maxLength={180} /></label>
              <label>Description<textarea rows={3} value={form.description} onChange={update("description")} required /></label>
              <div className="admin-form__row">
                <label>Event date/time<input type="datetime-local" value={form.eventDate} onChange={update("eventDate")} required /></label>
                <label>Registration deadline<input type="datetime-local" value={form.registrationDeadline} onChange={update("registrationDeadline")} /></label>
              </div>
              <label>Location<input value={form.location} onChange={update("location")} required maxLength={180} /></label>
              <div className="admin-form__row">
                <label>Total seats<input type="number" min={0} value={form.totalSeats} onChange={update("totalSeats")} required /></label>
                <label>Ticket price (₹)<input type="number" min={0} step="0.01" value={form.ticketPrice} onChange={update("ticketPrice")} required /></label>
              </div>

              <div className="admin-form__row">
                <label className="check"><input type="checkbox" checked={form.registrationEnabled} onChange={update("registrationEnabled")} /> Registration open</label>
                <label className="check"><input type="checkbox" checked={form.paidEvent} onChange={update("paidEvent")} /> Paid event</label>
              </div>
              <div className="admin-form__row">
                <label className="check"><input type="checkbox" checked={form.featured} onChange={update("featured")} /> Featured</label>
                <label className="check"><input type="checkbox" checked={form.available} onChange={update("available")} /> Available</label>
              </div>

              <label>Banner image URL<input value={form.bannerImageUrl} onChange={update("bannerImageUrl")} placeholder="https:// or storage path" /></label>
              <label>QR image URL<input value={form.qrImageUrl} onChange={update("qrImageUrl")} placeholder="Supabase Storage public URL" /></label>
              <label>UPI ID<input value={form.upiId} onChange={update("upiId")} placeholder="optional" /></label>
              <label>Payment instructions<textarea rows={2} value={form.paymentInstructions} onChange={update("paymentInstructions")} maxLength={1000} /></label>
              <label>Status<input value={form.status} onChange={update("status")} placeholder="UPCOMING / LIVE / CLOSED" /></label>

              <div className="admin-form__actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
