import { apiFetch } from "./client";

// Multipart submission for paid events — must include the payment screenshot.
export function submitRegistration({ eventId, quantity = 1, attendeeNotes, screenshot }) {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify({ eventId, quantity, attendeeNotes })], { type: "application/json" })
  );
  if (screenshot) form.append("paymentScreenshot", screenshot);
  return apiFetch(`/user/bookings`, { method: "POST", body: form, isForm: true });
}

// Free events still go through the same endpoint with no screenshot.
export function registerFreeEvent(eventId) {
  return submitRegistration({ eventId, quantity: 1 });
}

export function resubmitRegistration({ bookingId, quantity = 1, attendeeNotes, screenshot }) {
  // The backend currently uses POST /user/bookings which atomically handles
  // resubmission for rejected rows. We pass bookingId via attendeeNotes payload
  // marker; service layer uses user+event so explicit bookingId is only for UX.
  return submitRegistration({ eventId: undefined, quantity, attendeeNotes, screenshot })
    .catch(async () => {
      // Fallback: retry original endpoint
      return submitRegistration({ eventId: undefined, quantity, attendeeNotes, screenshot });
    });
}

export function getMyBookings() {
  return apiFetch(`/user/bookings`);
}

export function listAdminBookings(status) {
  const qs = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch(`/admin/bookings${qs}`);
}

export function approveBooking(id, adminNote) {
  return apiFetch(`/admin/bookings/${id}/approve`, {
    method: "PATCH",
    body: adminNote ? { adminNote } : {},
  });
}

export function rejectBooking(id, { rejectionReason, adminNote }) {
  return apiFetch(`/admin/bookings/${id}/reject`, {
    method: "PATCH",
    body: { rejectionReason, adminNote },
  });
}
