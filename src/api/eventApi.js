import { apiFetch } from "./client";

export function listPublicEvents({ page = 0, size = 10, search } = {}) {
  const qs = new URLSearchParams({ page, size });
  if (search) qs.set("search", search);
  return apiFetch(`/public/events?${qs.toString()}`, { auth: false });
}

export function getUpcomingEvent() {
  return apiFetch(`/public/events/upcoming`, { auth: false });
}

export function getEventById(id) {
  return apiFetch(`/public/events/${id}`, { auth: false });
}

export function listAdminEvents({ page = 0, size = 10, search } = {}) {
  const qs = new URLSearchParams({ page, size });
  if (search) qs.set("search", search);
  return apiFetch(`/admin/events?${qs.toString()}`);
}

export function createEvent(payload) {
  return apiFetch(`/admin/events`, { method: "POST", body: payload });
}

export function updateEvent(id, payload) {
  return apiFetch(`/admin/events/${id}`, { method: "PUT", body: payload });
}

export function deleteEvent(id) {
  return apiFetch(`/admin/events/${id}`, { method: "DELETE" });
}
