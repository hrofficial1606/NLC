import { useEffect, useState } from "react";
import { adminApi, registrationApi } from "../../api";

const STATUSES = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function statusClass(status) {
  return `status-pill status-pill--${(status || "").toLowerCase()}`;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatAmount(value) {
  if (value === null || value === undefined) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function ReviewModal({ booking, onClose, onAction, busy }) {
  const [adminNote, setAdminNote] = useState(booking.adminNote || "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  async function handleApprove() {
    setError("");
    try {
      await onAction("APPROVED", { adminNote });
      onClose();
    } catch (err) {
      setError(err.message || "Approve failed");
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }
    setError("");
    try {
      await onAction("REJECTED", { rejectionReason: rejectionReason.trim(), adminNote });
      onClose();
    } catch (err) {
      setError(err.message || "Reject failed");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Review registration</h2>
        <dl className="review-modal__details">
          <div><dt>Event</dt><dd>{booking.eventTitle || `#${booking.eventId}`}</dd></div>
          <div><dt>Reference</dt><dd>{booking.bookingReference}</dd></div>
          <div><dt>Quantity</dt><dd>{booking.quantity}</dd></div>
          <div><dt>Expected fee</dt><dd>{formatAmount(booking.totalAmount)}</dd></div>
          <div><dt>Submitted</dt><dd>{formatDate(booking.submittedAt || booking.createdAt)}</dd></div>
          <div><dt>Status</dt><dd><span className={statusClass(booking.status)}>{booking.status}</span></dd></div>
        </dl>

        {booking.paymentScreenshotUrl ? (
          <div className="review-modal__proof">
            <p>Payment proof (secure, short-lived URL):</p>
            <a href={booking.paymentScreenshotUrl} target="_blank" rel="noreferrer noopener">
              Open screenshot in new tab
            </a>
            <img src={booking.paymentScreenshotUrl} alt="Payment proof" />
          </div>
        ) : (
          <p className="muted">No payment screenshot attached (free event or none uploaded).</p>
        )}

        <label>Admin note (internal, optional)
          <textarea rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
        </label>
        <label>Rejection reason (required to reject)
          <textarea rows={2} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} maxLength={1000} />
        </label>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="admin-form__actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleReject} disabled={busy}>
            {busy ? "..." : "Reject"}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleApprove} disabled={busy}>
            {busy ? "..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRegistrationsPage() {
  const [status, setStatus] = useState("PENDING");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await registrationApi.listAdminBookings(status);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function handleAction(bookingId, action, payload) {
    setBusy(true);
    try {
      if (action === "APPROVED") {
        await registrationApi.approveBooking(bookingId, payload?.adminNote);
      } else {
        await registrationApi.rejectBooking(bookingId, payload);
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.eventTitle || "").toLowerCase().includes(q) ||
      (b.bookingReference || "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="admin-page">
      <h1>Registrations</h1>

      <div className="admin-toolbar">
        <div className="admin-filters">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-pill ${status === s ? "is-active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search by event or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && filtered.length === 0 ? (
        <div className="empty-state">
          <p>No registrations match this filter.</p>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Event</th>
              <th>Amount</th>
              <th>Submitted</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>{b.bookingReference}</td>
                <td>{b.eventTitle || `#${b.eventId}`}</td>
                <td>{formatAmount(b.totalAmount)}</td>
                <td>{formatDate(b.submittedAt || b.createdAt)}</td>
                <td><span className={statusClass(b.status)}>{b.status}</span></td>
                <td>
                  <button type="button" className="btn btn-outline" onClick={() => setReviewing(b)}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {reviewing ? (
        <ReviewModal
          booking={reviewing}
          onClose={() => setReviewing(null)}
          onAction={(action, payload) => handleAction(reviewing.id, action, payload)}
          busy={busy}
        />
      ) : null}
    </section>
  );
}
