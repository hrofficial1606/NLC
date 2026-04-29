import Button from "./ui/Button";

export default function Membership({ membership }) {
  return (
    <section className="membership-section" id="membership">
      <div className="container membership-section__inner">
        <div className="membership-section__star" aria-hidden="true">
          <img src="/images/nlc-logo.png" alt="" className="membership-section__logo" />
        </div>
        <div className="membership-section__content">
          <p className="membership-section__eyebrow">New</p>
          <h2>{membership?.title ?? "New Membership"}</h2>
          <p className="membership-section__description">
            {membership?.description ??
              "Join us in our mission to uplift women and foster a supportive community."}
          </p>
          <Button className="membership-section__button">Get your Membership Now</Button>
        </div>
      </div>
    </section>
  );
}
