import { apiFetch } from "./client";

export function submitContact(payload) {
  return apiFetch(`/public/contact`, { method: "POST", body: payload, auth: false });
}
