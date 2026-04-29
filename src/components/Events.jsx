import Button from "./ui/Button";
import SectionTitle from "./ui/SectionTitle";

export default function Events({ event }) {
  return (
    <section className="events-section" id="events">
      <div className="container events-section__inner">
        <SectionTitle title="Upcoming Events" className="events-section__heading" />

        <div className="event-visual" aria-hidden="true">
          <div className="event-visual__screen event-visual__screen--left" />
          <div className="event-visual__screen event-visual__screen--center" />
          <div className="event-visual__screen event-visual__screen--right" />
          <div className="event-visual__table event-visual__table--one" />
          <div className="event-visual__table event-visual__table--two" />
          <div className="event-visual__table event-visual__table--three" />
        </div>

        <h3 className="events-section__title">{event?.title ?? "Get-Together"}</h3>
        <p className="events-section__description">
          {event?.description ??
            "Join us in our mission to uplift women and foster a supportive community."}
        </p>

        <div className="events-section__actions">
          <Button>Connect Now</Button>
          <Button variant="secondary">see all</Button>
        </div>
      </div>
    </section>
  );
}
