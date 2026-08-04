import { apiFetch } from "./client";

export function getAboutContent() {
  return apiFetch(`/public/about/content`, { auth: false });
}

export function listAdminAboutContent() {
  return apiFetch(`/admin/about-content`);
}

export function saveAboutContent(payload) {
  return apiFetch(`/admin/about-content`, { method: "POST", body: payload });
}

export function getSponsors() {
  return apiFetch(`/public/sponsors`, { auth: false });
}

export function listAdminSponsors() {
  return apiFetch(`/admin/sponsors`);
}

export function createSponsor(payload) {
  return apiFetch(`/admin/sponsors`, { method: "POST", body: payload });
}

export function updateSponsor(id, payload) {
  return apiFetch(`/admin/sponsors/${id}`, { method: "PUT", body: payload });
}

export function deleteSponsor(id) {
  return apiFetch(`/admin/sponsors/${id}`, { method: "DELETE" });
}
