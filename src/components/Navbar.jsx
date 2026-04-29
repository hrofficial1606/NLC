import Button from "./ui/Button";

const navLinks = ["Home", "Events", "Membership", "Blogs", "About us"];

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="site-header__top">
        <div className="container site-header__top-inner">
          <p>Celebrations | Connect | Empowerment</p>
          <div className="site-header__socials">
            <span>IG</span>
            <span>f</span>
            <Button variant="small">Contact us</Button>
          </div>
        </div>
      </div>

      <div className="site-header__brandbar">
        <div className="container site-header__brand-inner">
          <div className="mini-brand">
            <img src="/images/nlc-logo.png" alt="Nagpur Ladies Club" className="mini-brand__image" />
          </div>
        </div>
      </div>

      <nav className="site-header__nav">
        <div className="container">
          <ul className="site-header__nav-list">
            {navLinks.map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
