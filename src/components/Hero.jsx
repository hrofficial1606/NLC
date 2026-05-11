import Button from "./ui/Button";

export default function Hero({ onNavigate = () => {} }) {
  return (
    <section className="hero-section" id="home">
      <div className="container hero-section__inner">
        <div className="hero-copy">
          <h1>Empower women for a brighter future</h1>
          <p>
            Every gathering we host is a celebration of women&apos;s empowerment,
            fostering connections and friendships that last a lifetime.
          </p>
          <Button onClick={() => onNavigate("membership")}>Join Community</Button>
        </div>

        <div className="hero-logo">
          <img src="/images/hero-logo.png" alt="Nagpur Ladies Club logo" className="hero-logo__image" />
        </div>
      </div>
    </section>
  );
}
