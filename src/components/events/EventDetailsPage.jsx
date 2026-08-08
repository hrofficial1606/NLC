import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { eventApi, registrationApi } from "../../api";
import { useAuth } from "../../context/AuthContext";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function isDeadlinePassed(deadline) {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [attendeeNotes, setAttendeeNotes] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await eventApi.getEventById(id);
        if (mounted) setEvent(data);
      } catch (err) {
        if (mounted) setError(err.message || "Event not found.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  function onPickScreenshot(e) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setScreenshot(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG or WebP images are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large (max 10MB).");
      return;
    }
    setError("");
    setScreenshot(file);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setSubmitMessage("");
    setError("");
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    if (event?.paidEvent && !screenshot) {
      setError("Please upload a payment screenshot before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      await registrationApi.submitRegistration({
        eventId: Number(id),
        quantity,
        attendeeNotes,
        screenshot: event?.paidEvent ? screenshot : null,
      });
      setSubmitMessage(
        event?.paidEvent
          ? "Payment proof submitted. Your registration is pending admin approval."
          : "Registration submitted successfully."
      );
      setScreenshot(null);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page page--event-details">
        <div className="container">
          <p className="page-loading">Loading event…</p>
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="page page--event-details">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <Link to="/events" className="btn btn-outline">Back to events</Link>
        </div>
      </main>
    );
  }

  if (!event) return null;

  const deadlinePassed = isDeadlinePassed(event.registrationDeadline);
  const registrationClosed = !event.registrationEnabled || !event.available || deadlinePassed;

  return (
    <main className="page page--event-details">
      <div className="container">
        <Link to="/events" className="back-link">← Back to events</Link>

        <article className="event-details">
          {event.bannerImageUrl ? (
            <div className="event-details__hero">
              <img src={event.bannerImageUrl} alt={event.title} />
            </div>
          ) : (
            <div className="event-details__hero">
              <div className="event-details__placeholder" aria-hidden="true">✦</div>
            </div>
          )}

          <div className="event-details__head">
            <span className={`event-card__badge ${event.paidEvent ? "is-paid" : "is-free"}`}>
              {event.paidEvent ? "Paid" : "Free"}
            </span>
            <h1>{event.title}</h1>
            <div className="event-details__meta-row">
              <span>📅 {formatDate(event.eventDate)}</span>
              <span>📍 {event.location}</span>
              {event.availableSeats ? <span>👤 {event.availableSeats} seats left</span> : null}
            </div>
            {event.paidEvent ? (
              <p className="event-details__price">
                Registration fee: ₹{Number(event.ticketPrice || 0).toLocaleString("en-IN")}
              </p>
            ) : null}
            {event.registrationDeadline ? (
              <p className="event-details__meta-row">
                <span>⏰ Registration deadline: {formatDate(event.registrationDeadline)}
                  {deadlinePassed ? <strong> (passed)</strong> : null}
                </span>
              </p>
            ) : null}
          </div>

          <section className="event-details__body">
            {event.description ? (
              <p className="event-details__description">{event.description}</p>
            ) : (
              <p className="event-details__description">No additional details provided.</p>
            )}
          </section>

          <section className="event-registration">
            <h2>Register</h2>
            {registrationClosed ? (
              <div className="alert alert-info">Registration is closed for this event.</div>
            ) : (
              <form onSubmit={handleRegister} className="event-registration__form">
                {!isAuthenticated ? (
                  <p className="event-registration__notice">
                    You need to be signed in to register.{" "}
                    <Link to="/login" state={{ from: { pathname: `/events/${id}` } }}>
                      Sign in
                    </Link>{" "}
                    or <Link to="/register">create an account</Link>.
                  </p>
                ) : null}

                {event.paidEvent ? (
                  <div className="event-registration__paid">
                    <h3>💗 Pay via QR / UPI</h3>
                    <ol className="event-registration__steps">
                      <li>Scan the QR code below or use the UPI ID.</li>
                      <li>Pay the registration fee of ₹{Number(event.ticketPrice || 0).toLocaleString("en-IN")}.</li>
                      <li>Take a clear screenshot of the successful payment.</li>
                      <li>Upload the screenshot below and submit.</li>
                      <li>Wait for admin verification. Your registration will be marked PENDING.</li>
                    </ol>

                    <div className="event-registration__qr">
                      {event.qrImageUrl ? (
                        <img src={event.qrImageUrl} alt="Payment QR" />
                      ) : (
                        <p className="muted">QR code will be shown here once the admin uploads it.</p>
                      )}
                    </div>

                    {event.upiId ? (
                      <p className="event-registration__upi">
                        UPI ID: <strong>{event.upiId}</strong>
                      </p>
                    ) : null}

                    {event.paymentInstructions ? (
                      <p className="event-registration__instructions">{event.paymentInstructions}</p>
                    ) : null}

                    <label className="event-registration__file">
                      Payment screenshot
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={onPickScreenshot}
                        required
                      />
                      {screenshot ? <span className="muted">{screenshot.name}</span> : null}
                    </label>
                  </div>
                ) : null}

                <label className="event-registration__qty">
                  Quantity
                  <input
                    type="number"
                    min={1}
                    max={Math.max(event.availableSeats || 10, 1)}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  />
                </label>

                <label className="event-registration__notes">
                  Notes (optional)
                  <textarea
                    rows={2}
                    value={attendeeNotes}
                    onChange={(e) => setAttendeeNotes(e.target.value)}
                    maxLength={1000}
                  />
                </label>

                {error ? <div className="alert alert-error">{error}</div> : null}
                {submitMessage ? <div className="alert alert-success">{submitMessage}</div> : null}

                <button type="submit" className="btn btn-primary" disabled={submitting || !isAuthenticated}>
                  {submitting ? "Submitting..." : event.paidEvent ? "Submit payment proof" : "Register"}
                </button>
              </form>
            )}
          </section>
        </article>
      </div>
    </main>
  );
}
