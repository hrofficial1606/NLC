const defaultCreator = {
  name: "Soniya Parmar",
  designation: "Owner - Founder - Event Organizer",
  bio:
    "A dynamic entrepreneur, event organizer, and the founder of Nagpur Ladies Club, known for her strong vision of women empowerment. Based in Nagpur, she has built a vibrant community connecting over 160 women entrepreneurs and creating opportunities for growth and networking.",
  imageUrl: "/images/image.png",
};

export default function Creator({ creator = defaultCreator }) {
  const profile = creator ?? defaultCreator;

  return (
    <section className="creator-section" id="about-us">
      <div className="container creator-section__inner">
        <div className="creator-section__art">
          <div className="creator-section__photo-frame">
            <img
              className="creator-section__photo"
              src={profile.imageUrl || defaultCreator.imageUrl}
              alt={profile.name || defaultCreator.name}
            />
          </div>
          <div className="creator-section__identity">
            <h3>{profile.name || defaultCreator.name}</h3>
            <p>{profile.designation || defaultCreator.designation}</p>
          </div>
        </div>

        <div className="creator-section__copy">
          <h2>Know the Creator</h2>
          <p>{profile.bio || defaultCreator.bio}</p>
        </div>
      </div>
    </section>
  );
}
