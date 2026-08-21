import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { membershipApi } from "../../api";

const STEP_LABELS = ["Personal details", "Payment", "Upload screenshot", "Submit"];

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

function validateStep1(form) {
  const errors = {};
  if (!form.fullName || form.fullName.trim().length < 3) errors.fullName = "Full name is required";
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Valid email is required";
  if (!form.phoneNumber || !/^[0-9]{10,15}$/.test(form.phoneNumber))
    errors.phoneNumber = "10–15 digit phone number is required";
  if (!form.password || form.password.length < 8) errors.password = "Password must be at least 8 characters";
  return errors;
}

function statusLabel(status) {
  if (!status) return "Approved";
  return status;
}

function StatusCard({ record, fee }) {
  const status = (record?.registrationStatus || "APPROVED").toUpperCase();
  const tone =
    status === "PENDING"
      ? "status-card--pending"
      : status === "REJECTED"
        ? "status-card--rejected"
        : "status-card--approved";

  let title = "Welcome to Nagpur Ladies Club";
  let body = "Your membership is active. You can sign in and start exploring events and the community.";
  if (status === "PENDING") {
    title = "Your application is under review";
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
      <p className="status-card__eyebrow">Membership status · {status}</p>
      <h2>{title}</h2>
      <p>{body}</p>
      {record?.rejectionReason ? (
        <p>
          <strong>Reason from admin:</strong> {record.rejectionReason}
        </p>
      ) : null}
      {record?.submittedAt ? (
        <p className="muted">Submitted on {new Date(record.submittedAt).toLocaleString()}</p>
      ) : null}
      {record?.hasPaymentProof ? (
        <p className="muted">Payment proof attached · fee ₹{fee}</p>
      ) : null}
      {status === "APPROVED" ? (
        <Link to="/login" className="btn btn-primary">Sign in</Link>
      ) : null}
    </div>
  );
}

export default function MembershipApplyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    city: "",
    profession: "",
    instagramProfile: "",
  });
  const [errors, setErrors] = useState({});
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    let cancelled = false;
    membershipApi
      .getMembershipConfig()
      .then((cfg) => {
        if (!cancelled) setConfig(cfg);
      })
      .catch((err) => {
        if (!cancelled) setConfigError(err.message || "Could not load payment configuration");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const feeAmount = useMemo(() => {
    if (!config) return "—";
    return config.feeAmount && Number(config.feeAmount) > 0
      ? `₹${Number(config.feeAmount).toLocaleString("en-IN")}`
      : config.fee || "—";
  }, [config]);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handleNext() {
    if (step === 0) {
      const stepErrors = validateStep1(form);
      setErrors(stepErrors);
      if (Object.keys(stepErrors).length > 0) return;
    }
    if (step === 2 && !screenshot) {
      setFileError("Please upload a payment screenshot to continue");
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setFileError("");
    if (!file) {
      setScreenshot(null);
      return;
    }
    if (!ALLOWED_TYPES.includes((file.type || "").toLowerCase())) {
      setFileError("Only JPG, JPEG, PNG, and WEBP files are allowed");
      setScreenshot(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("Screenshot must be 5MB or smaller");
      setScreenshot(null);
      return;
    }
    setScreenshot(file);
  }

  async function handleSubmit() {
    if (!screenshot) {
      setFileError("Please upload a payment screenshot to continue");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        ...form,
        paymentAmount: Number(config?.feeAmount || 0),
      };
      if (!payload.city) delete payload.city;
      if (!payload.profession) delete payload.profession;
      if (!payload.instagramProfile) delete payload.instagramProfile;
      const record = await membershipApi.submitMembershipRegistration({
        payload,
        screenshot,
      });
      setSubmitted(record);
      setStep(STEP_LABELS.length - 1);
    } catch (err) {
      setSubmitError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="membership-apply-page">
        <div className="container">
          <div className="apply-card">
            <StatusCard record={submitted} fee={feeAmount} />
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/", { replace: true })}
            >
              Back to home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="membership-apply-page">
      <div className="container">
        <div className="apply-card">
          <header className="apply-card__head">
            <p className="apply-card__eyebrow">Membership application</p>
            <h1>Apply for Nagpur Ladies Club</h1>
            <ol className="apply-stepper" aria-label="Application progress">
              {STEP_LABELS.map((label, idx) => (
                <li
                  key={label}
                  className={`apply-stepper__item ${
                    idx === step ? "is-active" : idx < step ? "is-done" : ""
                  }`}
                >
                  <span className="apply-stepper__num">{idx + 1}</span>
                  <span className="apply-stepper__label">{label}</span>
                </li>
              ))}
            </ol>
          </header>

          {configError ? <div className="alert alert-error">{configError}</div> : null}

          {step === 0 ? (
            <section className="apply-step">
              <h2>Personal details</h2>
              <p className="muted">
                Tell us about yourself. Your account will be activated after your
                membership fee payment is verified.
              </p>
              <form className="apply-form" noValidate onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
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
                  {errors.fullName ? <span className="field-error">{errors.fullName}</span> : null}
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
                  {errors.email ? <span className="field-error">{errors.email}</span> : null}
                </label>
                <label>
                  Phone number
                  <input
                    type="tel"
                    required
                    pattern="^[0-9]{10,15}$"
                    value={form.phoneNumber}
                    onChange={update("phoneNumber")}
                    placeholder="10–15 digit phone"
                  />
                  {errors.phoneNumber ? <span className="field-error">{errors.phoneNumber}</span> : null}
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
                  {errors.password ? <span className="field-error">{errors.password}</span> : null}
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
                <label>
                  Instagram handle (optional)
                  <input
                    type="text"
                    value={form.instagramProfile}
                    onChange={update("instagramProfile")}
                    placeholder="@yourhandle"
                  />
                </label>
                <div className="apply-actions">
                  <Link to="/membership" className="btn btn-outline">Cancel</Link>
                  <button type="submit" className="btn btn-primary">Continue</button>
                </div>
              </form>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="apply-step">
              <h2>Pay the membership fee</h2>
              <p>
                Membership fee: <strong>{feeAmount}</strong>
              </p>
              {config?.paymentInstructions ? (
                <p className="muted">{config.paymentInstructions}</p>
              ) : null}

              <div className="payment-grid">
                <div className="payment-qr">
                  {config?.qrImageUrl ? (
                    <img src={config.qrImageUrl} alt="Membership payment QR" />
                  ) : (
                    <div className="payment-qr__placeholder">QR will be configured by admin</div>
                  )}
                  <p className="muted">Scan with any UPI app to pay the membership fee.</p>
                </div>
                <div className="payment-upi">
                  <h3>UPI ID</h3>
                  <code className="payment-upi__id">{config?.upiId || "—"}</code>
                  <p className="muted">
                    After paying, proceed to the next step and upload a screenshot
                    of the successful payment. Your application will only be
                    approved after an admin reviews the payment.
                  </p>
                </div>
              </div>
              <div className="apply-actions">
                <button type="button" className="btn btn-outline" onClick={handleBack}>Back</button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  I have paid — continue
                </button>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="apply-step">
              <h2>Upload payment screenshot</h2>
              <p className="muted">
                Allowed formats: JPG, JPEG, PNG, WEBP. Maximum size 5&nbsp;MB.
              </p>
              <label className="upload-field">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
                <span>{screenshot ? screenshot.name : "Choose a screenshot…"}</span>
              </label>
              {fileError ? <div className="alert alert-error">{fileError}</div> : null}
              {previewUrl ? (
                <div className="upload-preview">
                  <img src={previewUrl} alt="Selected screenshot preview" />
                </div>
              ) : null}
              <div className="apply-actions">
                <button type="button" className="btn btn-outline" onClick={handleBack}>Back</button>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Review &amp; submit
                </button>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="apply-step">
              <h2>Submit application</h2>
              <p>
                You are about to submit your membership application and payment
                proof for admin review. Your account will remain in{" "}
                <strong>pending</strong> status until approved.
              </p>
              <ul className="review-summary">
                <li><strong>Name:</strong> {form.fullName}</li>
                <li><strong>Email:</strong> {form.email}</li>
                <li><strong>Phone:</strong> {form.phoneNumber}</li>
                <li><strong>Fee:</strong> {feeAmount}</li>
                <li>
                  <strong>Screenshot:</strong>{" "}
                  {screenshot ? `${screenshot.name} (${(screenshot.size / 1024).toFixed(0)} KB)` : "—"}
                </li>
              </ul>
              {submitError ? <div className="alert alert-error">{submitError}</div> : null}
              <div className="apply-actions">
                <button type="button" className="btn btn-outline" onClick={handleBack} disabled={submitting}>
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting || !screenshot}
                >
                  {submitting ? "Submitting…" : "Submit application"}
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
