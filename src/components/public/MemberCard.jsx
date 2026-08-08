// Reusable MemberCard component for the public Members page.
// Renders a single member's photo (if present), name, role/designation,
// and bio (if present). Falls back to an elegant initial placeholder
// when no image is available.
export default function MemberCard({ member }) {
  if (!member) return null;
  const { name, designation, role, bio, imageUrl, photoUrl } = member;
  const photo = imageUrl || photoUrl;
  const roleLabel = designation || role;
  const initials = (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <article className="member-card">
      <div className="member-card__photo">
        {photo ? (
          <img src={photo} alt={name ? `Portrait of ${name}` : "Member portrait"} loading="lazy" />
        ) : (
          <span className="member-card__placeholder" aria-hidden="true">{initials}</span>
        )}
      </div>
      <div className="member-card__body">
        <h3 className="member-card__name">{name || "Member"}</h3>
        {roleLabel ? <p className="member-card__role">{roleLabel}</p> : null}
        {bio ? <p className="member-card__bio">{bio}</p> : null}
      </div>
    </article>
  );
}
