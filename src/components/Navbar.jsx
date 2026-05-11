import Button from "./ui/Button";

const navLinks = ["Home", "Events", "Membership", "Blogs", "About us"];

export default function Navbar({ currentPage = "home", onNavigate = () => {} }) {
  function handleClick(event, item) {
    event.preventDefault();

    if (item === "Events") {
      onNavigate("events");
      return;
    }

    if (item === "About us") {
      onNavigate("about");
      return;
    }

    if (item === "Membership") {
      onNavigate("membership");
      return;
    }

    onNavigate("home");

    const targetId = item.toLowerCase().replace(/\s+/g, "-");
    if (item !== "Home") {
      window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    }
  }

  function isActive(item) {
    if (item === "Events") {
      return currentPage === "events";
    }

    if (item === "About us") {
      return currentPage === "about";
    }

    if (item === "Membership") {
      return currentPage === "membership" || currentPage === "register";
    }

    return currentPage === "home" && item === "Home";
  }

  function getHref(item) {
    if (item === "Events") {
      return "/events";
    }

    if (item === "About us") {
      return "/about-us";
    }

    if (item === "Membership") {
      return "/membership";
    }

    return "/";
  }

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
                <a
                  href={getHref(item)}
                  onClick={(event) => handleClick(event, item)}
                  className={isActive(item) ? "is-active" : ""}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
