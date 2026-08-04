import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { registrationApi } from "../../api";
import { useAuth } from "../../context/AuthContext";

function statusLabel(status) {
  switch (status) {
    case "PENDING":
      return "Pending review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

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

export default function MyRegistrationsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resubmitting, setResubmitting] = useState(null); // bookingId
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await registrationApi.getMyBookings();
        if (mounted) setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load your registrations.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleResubmit(booking) {
    if (!screenshot) {
      setError("Please choose a payment screenshot to resubmit.");
      return;
    }
    try {
      setResubmitting(booking.id);
      setError("");
      await registrationApi.submitRegistration({
        eventId: booking.eventId,
        quantity: booking.quantity,
        attendeeNotes: booking.attendeeNotes,
        screenshot,
      });
      setScreenshot(null);
      // refresh
      const data = await registrationApi.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Resubmission failed.");
    } finally {
      setResubmitting(null);
    }
  }

  if (loading) {
    return (
      <main className="page page--my-registrations">
        <div className="container">
          <h1>My Registrations</h1>
          <p className="page-loading">Loading your registrations…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page page--my-registrations">
      <div className="container">
        <header className="page-header">
          <h1>My Registrations</h1>
          <p>Signed in as {user?.fullName} ({user?.email})</p>
        </header>

        {error ? <div className="alert alert-error">{error}</div> : null}

        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>You haven't registered for any events yet.</p>
            <Link to="/events" className="btn btn-primary">Browse events</Link>
          </div>
        ) : (
          <ul className="registration-list">
            {bookings.map((b) => (
              <li key={b.id} className="registration-card">
                <div className="registration-card__head">
                  <div>
                    <h3>{b.eventTitle || `Event #${b.eventId}`}</h3>
                    <p className="registration-card__meta">
                      Reference: {b.bookingReference} • Submitted {formatDate(b.submittedAt || b.createdAt)}
                    </p>
                  </div>
                  <span className={statusClass(b.status)}>{statusLabel(b.status)}</span>
                </div>

                <dl className="registration-card__details">
                  <div>
                    <dt>Quantity</dt>
                    <dd>{b.quantity}</dd>
                  </div>
                  <div>
                    <dt>Amount</dt>
                    <dd>{formatAmount(b.totalAmount)}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{b.paidEvent ? "Paid" : "Free"}</dd>
                  </div>
                  {b.reviewedAt ? (
                    <div>
                      <dt>Reviewed</dt>
                      <dd>{formatDate(b.reviewedAt)}</dd>
                    </div>
                  ) : null}
                </dl>

                {b.status === "PENDING" ? (
                  <p className="registration-card__hint">
                    Your payment proof is under review. You'll see the decision here.
                  </p>
                ) : null}

                {b.status === "APPROVED" ? (
                  <p className="registration-card__hint registration-card__hint--success">
                    Your registration has been approved. See you at the event!
                  </p>
                ) : null}

                {b.status === "REJECTED" ? (
                  <div className="registration-card__reject">
                    <p>
                      <strong>Rejected:</strong> {b.rejectionReason || "No reason provided."}
                    </p>
                    <div className="registration-card__resubmit">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={resubmitting === b.id}
                        onClick={() => handleResubmit(b)}
                      >
                        {resubmitting === b.id ? "Submitting..." : "Resubmit payment proof"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
