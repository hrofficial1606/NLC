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
            <img src="/images/nlc-logo.jpeg" alt="NLC" className="public-header__logo" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <span>Nagpur Ladies Club</span>
          </Link>
          <button type="button" className="public-header__burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            ☰
          </button>
          <nav className={`public-header__nav ${open ? "is-open" : ""}`}>
            <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/events" onClick={() => setOpen(false)}>Events</NavLink>
            <NavLink to="/gallery" onClick={() => setOpen(false)}>Gallery</NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
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
                <NavLink to="/register" onClick={() => setOpen(false)} className="btn btn-primary">Join</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="public-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Nagpur Ladies Club. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
