import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    city: "",
    profession: "",
  });
  const [error, setError] = useState("");

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Join Nagpur Ladies Club</h1>
        <p className="auth-subtitle">Create your account to register for events and manage your membership.</p>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label>
            Full name
            <input
              type="text"
              required
              minLength={3}
              value={form.fullName}
              onChange={update("fullName")}
              placeholder="Your full name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Phone number
            <input
              type="tel"
              required
              pattern="^[0-9]{10,15}$"
              value={form.phoneNumber}
              onChange={update("phoneNumber")}
              placeholder="10-15 digit phone"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              placeholder="At least 8 characters"
            />
          </label>
          <div className="auth-row">
            <label className="auth-half">
              City
              <input type="text" value={form.city} onChange={update("city")} placeholder="Nagpur" />
            </label>
            <label className="auth-half">
              Profession
              <input type="text" value={form.profession} onChange={update("profession")} placeholder="Optional" />
            </label>
          </div>
          {error ? <div className="auth-error">{error}</div> : null}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
