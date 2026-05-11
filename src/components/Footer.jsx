export default function Footer({
  variant = "default",
  currentPage = "home",
  onNavigate = () => {},
}) {
  function footerLink(target, label) {
    const href =
      target === "events"
        ? "/events"
        : target === "about"
          ? "/about-us"
          : target === "membership"
            ? "/membership"
            : "/";

    const isMembershipActive =
      target === "membership" && (currentPage === "membership" || currentPage === "register");
    const className =
      currentPage === target || isMembershipActive ? "is-active" : "";

    return (
      <a
        href={href}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(target);
        }}
      >
        {label}
      </a>
    );
  }

  if (variant === "rich") {
    return (
      <footer className="site-footer site-footer--event">
        <div className="container site-footer__event-inner">
          <div>
            <h3>Quick links</h3>
            <div className="site-footer__event-links">
              {footerLink("home", "Home")}
              {footerLink("events", "Events")}
              {footerLink("membership", "Membership")}
              {footerLink("home", "Blogs")}
              {footerLink("about", "About us")}
            </div>
          </div>
          <div>
            <h3>Contact</h3>
            <div className="site-footer__event-contact">
              <p>Nagpur</p>
              <p>9877654477</p>
              <p>asdfghjk@gmail.com</p>
            </div>
          </div>
          <div>
            <h3>Follow us</h3>
            <div className="site-footer__event-socials">
              <span>IG</span>
              <span>f</span>
            </div>
          </div>
        </div>
        <p className="site-footer__event-meta">
          ©2026 Nagpur Ladies Club | All rights reserved | Designed with ❤️
        </p>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <h3>Nagpur Ladies Club</h3>
          <p>Celebrations | Connect | Empowerment</p>
        </div>
        <div className="site-footer__links">
          {footerLink("events", "Events")}
          {footerLink("membership", "Membership")}
          {footerLink("about", "About us")}
        </div>
        <p className="site-footer__copyright">© 2026 Nagpur Ladies Club</p>
      </div>
    </footer>
  );
}
