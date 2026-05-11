const eventItems = [
  { id: 1, titleTop: "Raas", titleBottom: "Garba", accent: "script" },
  { id: 2, titleTop: "Mile Sur", titleBottom: "Mera Tumhara", accent: "pink" },
  { id: 3, titleTop: "Akshay", titleBottom: "Tritiya", accent: "caps" },
  { id: 4, titleTop: "Women's Day", titleBottom: "", accent: "single" },
  { id: 5, titleTop: "Gudi", titleBottom: "Padwa", accent: "script" },
  { id: 6, titleTop: "Nedal Khalbat", titleBottom: "", accent: "pink" },
];

function EventCard({ titleTop, titleBottom, accent }) {
  return (
    <article className="event-page__card">
      <div className="event-page__thumb" />
      <div className={`event-page__label event-page__label--${accent}`}>
        <span>{titleTop}</span>
        {titleBottom ? <span>{titleBottom}</span> : null}
      </div>
    </article>
  );
}

export default function EventPage() {
  return (
    <section className="event-page" aria-label="Events page">
      <div className="container event-page__inner">
        <div className="event-page__grid">
          {eventItems.map((item) => (
            <EventCard key={item.id} {...item} />
          ))}
        </div>
        <span className="event-page__dot" aria-hidden="true" />
      </div>
    </section>
  );
}
