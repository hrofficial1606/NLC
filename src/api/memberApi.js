import { apiFetch } from "./client";

export function getTeamMembers() {
  return apiFetch(`/public/about/team`, { auth: false });
}

export function listAdminTeam() {
  return apiFetch(`/admin/team`);
}

export function createTeamMember(payload) {
  return apiFetch(`/admin/team`, { method: "POST", body: payload });
}

export function updateTeamMember(id, payload) {
  return apiFetch(`/admin/team/${id}`, { method: "PUT", body: payload });
}

export function deleteTeamMember(id) {
  return apiFetch(`/admin/team/${id}`, { method: "DELETE" });
}
