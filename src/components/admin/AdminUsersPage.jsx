import { useEffect, useState } from "react";
import { adminApi } from "../../api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await adminApi.listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBlock(u) {
    try {
      if (u.blocked) {
        await adminApi.unblockUser(u.id);
      } else {
        await adminApi.blockUser(u.id);
      }
      await load();
    } catch (err) {
      setError(err.message || "Action failed");
    }
  }

  async function remove(u) {
    if (!window.confirm(`Delete user "${u.email}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(u.id);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.fullName || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  return (
    <section className="admin-page">
      <h1>Users</h1>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && filtered.length === 0 ? (
        <div className="empty-state"><p>No users match your search.</p></div>
      ) : null}

      {filtered.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Blocked</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{(u.roles || []).map((r) => r.replace("ROLE_", "")).join(", ")}</td>
                <td>{u.blocked ? "Yes" : "No"}</td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                <td className="admin-table__actions">
                  <button type="button" className="btn btn-outline" onClick={() => toggleBlock(u)}>
                    {u.blocked ? "Unblock" : "Block"}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => remove(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
