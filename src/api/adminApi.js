import { apiFetch } from "./client";

export function getDashboard() {
  return apiFetch(`/admin/dashboard`);
}

export function listUsers() {
  return apiFetch(`/admin/users`);
}

export function blockUser(id) {
  return apiFetch(`/admin/users/${id}/block`, { method: "PATCH" });
}

export function unblockUser(id) {
  return apiFetch(`/admin/users/${id}/unblock`, { method: "PATCH" });
}

export function deleteUser(id) {
  return apiFetch(`/admin/users/${id}`, { method: "DELETE" });
}

export function listContactInquiries() {
  return apiFetch(`/admin/contact-inquiries`);
}

export function resolveContactInquiry(id) {
  return apiFetch(`/admin/contact-inquiries/${id}/resolve`, { method: "PATCH" });
}

export function listMemberCards() {
  return apiFetch(`/admin/member-cards`);
}

export function issueMemberCard(payload) {
  return apiFetch(`/admin/member-cards`, { method: "POST", body: payload });
}

export function updateMemberCard(id, payload) {
  return apiFetch(`/admin/member-cards/${id}`, { method: "PUT", body: payload });
}

export function listAdminSponsors() {
  return apiFetch(`/admin/sponsors`);
}
