import { apiFetch } from "./client";

/**
 * Public membership payment configuration (fee, QR, UPI ID, instructions).
 * Returned by /public/membership/config — no auth required.
 */
export function getMembershipConfig() {
  return apiFetch("/public/membership/config", { auth: false });
}

/**
 * Submit a membership registration (multipart). The backend stores the
 * payment screenshot PRIVATELY in Supabase — never Cloudinary.
 */
export function submitMembershipRegistration({ payload, screenshot }) {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  if (screenshot) form.append("paymentScreenshot", screenshot);
  return apiFetch("/auth/register-membership", {
    method: "POST",
    body: form,
    isForm: true,
    auth: false,
  });
}

/** Authenticated: fetch the caller's own membership registration status. */
export function getMyMembershipRegistration() {
  return apiFetch("/user/membership-registration");
}

/** Admin: list all membership applications, optionally filtered by status. */
export function listAdminMembershipRegistrations(status) {
  const qs = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch(`/admin/membership-registrations${qs}`);
}

/** Admin: short-lived signed URL for a membership payment proof. */
export function getAdminMembershipPaymentProof(id) {
  return apiFetch(`/admin/membership-registrations/${id}/payment-proof`);
}

export function approveMembershipRegistration(id, payload = {}) {
  return apiFetch(`/admin/membership-registrations/${id}/approve`, {
    method: "PATCH",
    body: payload,
  });
}

export function rejectMembershipRegistration(id, { rejectionReason, adminNote }) {
  return apiFetch(`/admin/membership-registrations/${id}/reject`, {
    method: "PATCH",
    body: { rejectionReason, adminNote },
  });
}
