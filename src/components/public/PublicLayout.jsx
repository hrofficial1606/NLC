import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="container public-header__inner">
          <Link to="/" className="public-header__brand">
            <img
              src="/images/nlc-logo.jpeg"
              alt="Nagpur Ladies Club"
              className="public-header__logo"
              onError={(e) => { e.currentTarget.src = "/images/nlc-logo.png"; }}
            />
            <span>Nagpur Ladies Club</span>
          </Link>
          <button
            type="button"
            className="public-header__burger"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
          <nav className={`public-header__nav ${open ? "is-open" : ""}`}>
            <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
            <NavLink to="/events" onClick={() => setOpen(false)}>Events</NavLink>
            <NavLink to="/gallery" onClick={() => setOpen(false)}>Gallery</NavLink>
            <NavLink to="/membership" onClick={() => setOpen(false)}>Membership</NavLink>
            <NavLink to="/members" onClick={() => setOpen(false)}>Members</NavLink>
            <NavLink to="/sponsors" onClick={() => setOpen(false)}>Sponsors</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/my-registrations" onClick={() => setOpen(false)}>My Registrations</NavLink>
                {isAdmin ? <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink> : null}
                <button type="button" className="btn btn-outline" onClick={handleLogout}>
                  Logout {user?.fullName ? `(${user.fullName.split(" ")[0]})` : ""}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)} className="btn btn-primary btn-script">Join</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="public-footer">
        <div className="container">
          <div className="public-footer__inner">
            <div className="public-footer__brand">
              <div className="public-footer__brand-mark">
                <img
                  src="/images/nlc-logo.jpeg"
                  alt="Nagpur Ladies Club"
                  onError={(e) => { e.currentTarget.src = "/images/nlc-logo.png"; }}
                />
                <span>Nagpur Ladies Club</span>
              </div>
              <p>
                A premium women&apos;s community celebrating friendship, culture, and empowerment in
                Nagpur. Connect with inspiring women, attend signature events, and grow with us.
              </p>
              <div className="public-footer__socials" aria-label="Social links">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="is-instagram">IG</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="is-facebook">FB</a>
              </div>
            </div>
            <div className="public-footer__col">
              <h4>Explore</h4>
              <ul>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/about">About</NavLink></li>
                <li><NavLink to="/events">Events</NavLink></li>
                <li><NavLink to="/gallery">Gallery</NavLink></li>
              </ul>
            </div>
            <div className="public-footer__col">
              <h4>Community</h4>
              <ul>
                <li><NavLink to="/membership">Membership</NavLink></li>
                <li><NavLink to="/members">Members</NavLink></li>
                <li><NavLink to="/sponsors">Sponsors</NavLink></li>
                <li><NavLink to="/register">Join NLC</NavLink></li>
                <li><NavLink to="/login">Sign in</NavLink></li>
              </ul>
            </div>
            <div className="public-footer__col">
              <h4>Get in touch</h4>
              <div className="public-footer__contact">
                <p>Nagpur, Maharashtra</p>
                <p>hello@nagpurladiesclub.in</p>
                <p>Community &middot; Culture &middot; Empowerment</p>
              </div>
            </div>
          </div>
          <div className="public-footer__bottom">
            <span>© {new Date().getFullYear()} Nagpur Ladies Club. All rights reserved.</span>
            <span>Celebrate. Connect. Empower.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
