const welcomeHighlights = [
  "celebrate, connect &",
  "grow",
  "culture, friendships & unforgettable",
];

const offerItems = [
  { top: "Garba", bottom: "Night", variant: "script" },
  { top: "Cultural", bottom: "Events", variant: "serif" },
  { top: "Community", bottom: "Meet up", variant: "mixed" },
  { top: "Workshops", bottom: "", variant: "pink-script" },
];

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-page__banner" />

      <div className="container about-page__content">
        <section className="about-page__intro">
          <h1>Welcome to Nagpur Ladies Club</h1>
          <p>
            A vibrant community where women come together to{" "}
            <span>{welcomeHighlights[0]}</span>{" "}
            <span>{welcomeHighlights[1]}</span>. From festive events to empowering opportunities, we create a space that
            inspires confidence, creativity, and collaboration. Join us and be part
            of a joyful journey filled with <span>{welcomeHighlights[2]}</span>{" "}
            experiences.
          </p>
        </section>

        <section className="about-page__split-section">
          <h2>✦ Our Vision ✦</h2>
          <div className="about-page__split about-page__split--vision">
            <img src="/images/about/Group 73.png" alt="" className="about-page__placeholder" />
            <p>
              The vision of Nagpur Ladies Club is to create a space where every
              woman feels seen, valued, and truly connected. It aims to bring women
              together through shared experiences, joyful celebrations, and
              meaningful interactions that go beyond everyday routines. By
              fostering a sense of belonging and togetherness, the club envisions a
              community where every woman can express herself freely and grow with
              confidence.
            </p>
          </div>
        </section>

        <section className="about-page__split-section">
          <h2>💖 Mission 💖</h2>
          <div className="about-page__split about-page__split--mission">
            <p>
              The mission of Nagpur Ladies Club is to curate engaging events,
              cultural experiences, and networking opportunities that bring women
              closer and encourage them to step out, participate, and shine.
              Through thoughtfully organized gatherings from vibrant celebrations to
              creative workshops the club strives to create moments of joy, build
              lasting connections, and support women in exploring their passions
              while being part of a supportive and uplifting community.
            </p>
            <img src="/images/about/Group 74.png" alt="" className="about-page__placeholder" />
          </div>
        </section>

        <section className="about-page__founder">
          <h2>~~~~~~~~~~~~~~~~Our Founder~~~~~~~~~~~~~~~</h2>
          <div className="about-page__split about-page__split--founder">
            <div className="about-page__founder-identity">
              <div className="about-page__founder-photo" />
              <h3>Soniya Parmar</h3>
            </div>
            <p>
              Soniya Parmar is the heart behind Nagpur Ladies Club, someone who
              turned her simple desire to bring women together into a beautiful,
              thriving community. Through her passion for creating meaningful
              moments, she has built a space where women feel welcomed, confident,
              and truly connected.
            </p>
          </div>
        </section>

        <section className="about-page__offers">
          <h2>~~~~~~~~~~~~~~~~What we offer ~~~~~~~~~~~~~~~~</h2>
          <div className="about-page__offer-visual">
            <img src="/images/about/Group 72.png" alt="" />
          </div>
          <div className="about-page__offer-labels">
            {offerItems.map((item) => (
              <div key={item.top} className={`about-page__offer-label about-page__offer-label--${item.variant}`}>
                <span>{item.top}</span>
                {item.bottom ? <span>{item.bottom}</span> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="about-page__community">
          <h2>~~~~~~~~~~~~~~~~Our Community ~~~~~~~~~~~~~~~~</h2>
          <div className="about-page__community-membership-strip" />
          <div className="about-page__community-grid-strip" />
        </section>

        <section className="about-page__why">
          <h2>~~~~~~~~~~~~~~~~Why join Us ~~~~~~~~~~~~~~~~</h2>
          <div className="about-page__why-grid">
            <div className="about-page__why-item">
              <p>Build meaningful connections</p>
              <img src="/images/about/Handshake.png" alt="" />
            </div>
            <div className="about-page__why-item">
              <p>Discover your confidence</p>
              <div className="about-page__why-heart">♡</div>
            </div>
            <div className="about-page__why-item">
              <p>Celebrate culture &amp; joy</p>
              <img src="/images/about/Party.png" alt="" />
            </div>
            <div className="about-page__why-item">
              <p>Be part of something special</p>
              <div className="about-page__why-star">☆</div>
            </div>
          </div>
        </section>

        <section className="about-page__cta">
          <div className="about-page__cta-card">
            <p>Ready to be part of this journey?</p>
            <button type="button">Join Now</button>
          </div>
        </section>
      </div>
    </section>
  );
}
