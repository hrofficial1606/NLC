import { useEffect, useState } from "react";
import { membershipApi } from "../../api";

const STATUSES = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function statusClass(status) {
  return `status-pill status-pill--${(status || "").toLowerCase()}`;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatAmount(value) {
  if (value === null || value === undefined) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function ReviewModal({ application, onClose, onAction, busy }) {
  const [adminNote, setAdminNote] = useState(application.adminNote || "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [signedUrl, setSignedUrl] = useState("");
  const [signedUrlLoading, setSignedUrlLoading] = useState(false);
  const [actionInFlight, setActionInFlight] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadProof() {
      if (!application.hasPaymentProof) {
        setSignedUrl("");
        return;
      }
      setSignedUrlLoading(true);
      try {
        const data = await membershipApi.getAdminMembershipPaymentProof(application.userId);
        if (!cancelled) setSignedUrl(data?.signedUrl || "");
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load payment proof");
      } finally {
        if (!cancelled) setSignedUrlLoading(false);
      }
    }
    loadProof();
    return () => {
      cancelled = true;
    };
  }, [application.userId, application.hasPaymentProof]);

  async function handleApprove() {
    setError("");
    try {
      setActionInFlight("APPROVE");
      await onAction("APPROVED", { adminNote });
      onClose();
    } catch (err) {
      setError(err.message || "Approve failed");
    } finally {
      setActionInFlight("");
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }
    setError("");
    try {
      setActionInFlight("REJECT");
      await onAction("REJECTED", {
        rejectionReason: rejectionReason.trim(),
        adminNote,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Reject failed");
    } finally {
      setActionInFlight("");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Review membership application</h2>
        <dl className="review-modal__details">
          <div><dt>Name</dt><dd>{application.fullName || "—"}</dd></div>
          <div><dt>Email</dt><dd>{application.email || "—"}</dd></div>
          <div><dt>Phone</dt><dd>{application.phoneNumber || "—"}</dd></div>
          <div><dt>City</dt><dd>{application.city || "—"}</dd></div>
          <div><dt>Profession</dt><dd>{application.profession || "—"}</dd></div>
          <div><dt>Fee</dt><dd>{formatAmount(application.paymentAmount)}</dd></div>
          <div><dt>Submitted</dt><dd>{formatDate(application.submittedAt || application.createdAt)}</dd></div>
          {application.reviewedAt ? (
            <div><dt>Reviewed</dt><dd>{formatDate(application.reviewedAt)}</dd></div>
          ) : null}
          <div>
            <dt>Status</dt>
            <dd><span className={statusClass(application.registrationStatus)}>{application.registrationStatus}</span></dd>
          </div>
        </dl>

        {application.hasPaymentProof ? (
          <div className="review-modal__proof">
            <p>Payment proof (secure, short-lived URL):</p>
            {signedUrlLoading ? (
              <p className="muted">Loading signed URL…</p>
            ) : signedUrl ? (
              <>
                <a href={signedUrl} target="_blank" rel="noreferrer noopener">
                  Open screenshot in new tab
                </a>
                <img src={signedUrl} alt="Payment proof" />
              </>
            ) : (
              <p className="muted">Could not retrieve payment proof URL.</p>
            )}
          </div>
        ) : (
          <p className="muted">No payment screenshot attached.</p>
        )}

        <label>Admin note (internal, optional)
          <textarea rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} maxLength={1000} />
        </label>
        <label>Rejection reason (required to reject)
          <textarea rows={2} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} maxLength={1000} />
        </label>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="admin-form__actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleReject}
            disabled={busy || actionInFlight !== ""}
          >
            {actionInFlight === "REJECT" ? "Rejecting…" : "Reject"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={busy || actionInFlight !== ""}
          >
            {actionInFlight === "APPROVE" ? "Approving…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMembershipApplicationsPage() {
  const [status, setStatus] = useState("PENDING");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await membershipApi.listAdminMembershipRegistrations(status);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load membership applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function handleAction(userId, action, payload) {
    setBusy(true);
    try {
      if (action === "APPROVED") {
        await membershipApi.approveMembershipRegistration(userId, payload);
      } else {
        await membershipApi.rejectMembershipRegistration(userId, payload);
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const filtered = applications.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (a.fullName || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q) ||
      (a.phoneNumber || "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="admin-page">
      <h1>Membership applications</h1>

      <div className="admin-toolbar">
        <div className="admin-filters">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-pill ${status === s ? "is-active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && filtered.length === 0 ? (
        <div className="empty-state">
          <p>No membership applications match this filter.</p>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Fee</th>
              <th>Submitted</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.userId}>
                <td>{a.fullName || "—"}</td>
                <td>{a.email || "—"}</td>
                <td>{a.phoneNumber || "—"}</td>
                <td>{formatAmount(a.paymentAmount)}</td>
                <td>{formatDate(a.submittedAt || a.createdAt)}</td>
                <td><span className={statusClass(a.registrationStatus)}>{a.registrationStatus}</span></td>
                <td>
                  <button type="button" className="btn btn-outline" onClick={() => setReviewing(a)}>
                    {a.registrationStatus === "PENDING" ? "Review" : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {reviewing ? (
        <ReviewModal
          application={reviewing}
          onClose={() => setReviewing(null)}
          onAction={(action, payload) => handleAction(reviewing.userId, action, payload)}
          busy={busy}
        />
      ) : null}
    </section>
  );
}
