import Button from "./ui/Button";

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="container hero-section__inner">
        <div className="hero-copy">
          <h1>Empower women for a brighter future</h1>
          <p>
            Every gathering we host is a celebration of women&apos;s empowerment,
            fostering connections and friendships that last a lifetime.
          </p>
          <Button>Join Community</Button>
        </div>

        <div className="hero-logo">
          <img src="/images/nlc-logo.png" alt="Nagpur Ladies Club logo" className="hero-logo__image" />
        </div>
      </div>
    </section>
  );
}
