import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventApi } from "../../api";

function formatEventDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function EventCard({ event }) {
  const priceLabel = event.paidEvent
    ? `₹${Number(event.ticketPrice || 0).toLocaleString("en-IN")}`
    : "Free";
  const closed = !event.registrationEnabled || !event.available;
  return (
    <article className="event-card">
      <div className="event-card__media">
        {event.bannerImageUrl ? (
          <img src={event.bannerImageUrl} alt={event.title} loading="lazy" />
        ) : (
          <div className="event-card__placeholder" aria-hidden="true">✦</div>
        )}
        <span className={`event-card__badge ${event.paidEvent ? "is-paid" : "is-free"}`}>
          {event.paidEvent ? "Paid" : "Free"}
        </span>
      </div>
      <div className="event-card__body">
        <h3>{event.title}</h3>
        <p className="event-card__meta">
          <span>📅 {formatEventDate(event.eventDate)}</span>
          <span>📍 {event.location}</span>
        </p>
        {event.shortDescription ? <p className="event-card__desc">{event.shortDescription}</p> : null}
        <div className="event-card__foot">
          <span className="event-card__price">{priceLabel}</span>
          <Link
            to={`/events/${event.id}`}
            className={`btn event-card__cta ${closed ? "btn-outline" : "btn-primary"}`}
            aria-disabled={closed}
          >
            {closed ? "Closed" : "View details"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await eventApi.listPublicEvents({ page: 0, size: 20, search: search || undefined });
        if (mounted) {
          const list = data?.content || (Array.isArray(data) ? data : []);
          setEvents(list);
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load events.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [search]);

  return (
    <main className="page page--events">
      <div className="container">
        <header className="page-header">
          <p className="page-header__eyebrow">What&apos;s on</p>
          <h1>Upcoming Events</h1>
          <p>Browse and register for upcoming Nagpur Ladies Club events.</p>
        </header>

        <div className="event-list-toolbar">
          <input
            type="search"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="event-list-toolbar__search"
            aria-label="Search events"
          />
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {loading ? <p className="page-loading">Loading events…</p> : null}

        {!loading && !error && events.length === 0 ? (
          <div className="empty-card">
            <span className="empty-card__mark">Upcoming</span>
            <h3>Something exciting is coming soon</h3>
            <p>
              Stay connected for our next celebration. The next unforgettable event is on its way.
            </p>
          </div>
        ) : null}

        <div className="event-list-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}
