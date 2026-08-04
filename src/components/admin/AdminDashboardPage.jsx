import { useEffect, useState } from "react";
import { adminApi } from "../../api";

const tiles = [
  { key: "totalUsers", label: "Total Users" },
  { key: "totalMembers", label: "Total Members" },
  { key: "totalEvents", label: "Total Events" },
  { key: "upcomingEvents", label: "Upcoming Events" },
  { key: "totalRegistrations", label: "Total Registrations" },
  { key: "pendingRegistrations", label: "Pending Registrations" },
  { key: "approvedRegistrations", label: "Approved Registrations" },
  { key: "rejectedRegistrations", label: "Rejected Registrations" },
  { key: "galleryItems", label: "Gallery Items" },
  { key: "openInquiries", label: "Open Inquiries" },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const d = await adminApi.getDashboard();
        if (mounted) setData(d);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="admin-page">
        <h1>Dashboard</h1>
        <p className="page-loading">Loading dashboard…</p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <h1>Dashboard</h1>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {data ? (
        <div className="dashboard-tiles">
          {tiles.map((tile) => (
            <div key={tile.key} className="dashboard-tile">
              <span className="dashboard-tile__label">{tile.label}</span>
              <span className="dashboard-tile__value">
                {(data?.[tile.key] ?? 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
