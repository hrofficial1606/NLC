import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/registrations", label: "Registrations" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/content", label: "About Content" },
  { to: "/admin/sponsors", label: "Sponsors" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className={`admin-shell ${open ? "is-open" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>NLC Admin</span>
        </div>
        <nav className="admin-sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? "is-active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__foot">
          <div className="admin-sidebar__user">
            <strong>{user?.fullName || "Admin"}</strong>
            <span>{user?.email}</span>
          </div>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <button
        type="button"
        className="admin-burger"
        aria-label="Toggle navigation"
        onClick={() => setOpen((o) => !o)}
      >
        ☰
      </button>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
