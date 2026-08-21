import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { membershipApi } from "../../api";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function StatusCard({ record }) {
  const status = (record?.registrationStatus || "APPROVED").toUpperCase();
  const tone =
    status === "PENDING"
      ? "status-card--pending"
      : status === "REJECTED"
        ? "status-card--rejected"
        : "status-card--approved";

  let title = "Membership active";
  let body =
    "Your membership is approved. You can register for events and enjoy member benefits.";
  if (status === "PENDING") {
    title = "Your membership application is under verification";
    body =
      "Your registration and payment are under verification. " +
      "We will email you once an administrator has reviewed your application.";
  } else if (status === "REJECTED") {
    title = "Your membership application was not approved";
    body =
      "Unfortunately we were unable to approve your membership application. " +
      "Please contact the club if you believe this was a mistake.";
  }

  return (
    <div className={`status-card ${tone}`}>
      <p className="status-card__eyebrow">Status · {status}</p>
      <h2>{title}</h2>
      <p>{body}</p>
      {record?.rejectionReason ? (
        <p>
          <strong>Reason from admin:</strong> {record.rejectionReason}
        </p>
      ) : null}
      {record?.submittedAt ? (
        <p className="muted">Submitted on {formatDate(record.submittedAt)}</p>
      ) : null}
      {record?.reviewedAt ? (
        <p className="muted">Reviewed on {formatDate(record.reviewedAt)}</p>
      ) : null}
      {record?.paymentAmount ? (
        <p className="muted">Payment amount: ₹{Number(record.paymentAmount).toLocaleString("en-IN")}</p>
      ) : null}
      {status === "APPROVED" ? (
        <Link to="/" className="btn btn-primary">Continue</Link>
      ) : null}
    </div>
  );
}

export default function MembershipStatusPage() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    membershipApi
      .getMyMembershipRegistration()
      .then((data) => setRecord(data || null))
      .catch((err) => setError(err.message || "Could not load membership status"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="membership-status-page">
      <div className="container">
        <h1>Your membership</h1>
        {loading ? <p className="page-loading">Loading…</p> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}
        {!loading && !error && record ? <StatusCard record={record} /> : null}
      </div>
    </main>
  );
}
