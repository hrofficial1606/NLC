import { apiFetch } from "./client";

export function listPublicGallery({ page = 0, size = 12 } = {}) {
  return apiFetch(`/public/gallery?page=${page}&size=${size}`, { auth: false });
}

export function listAdminGallery({ page = 0, size = 20 } = {}) {
  return apiFetch(`/admin/gallery?page=${page}&size=${size}`);
}

export function createGalleryItem(payload) {
  return apiFetch(`/admin/gallery`, { method: "POST", body: payload });
}

export function updateGalleryItem(id, payload) {
  return apiFetch(`/admin/gallery/${id}`, { method: "PUT", body: payload });
}

export function deleteGalleryItem(id) {
  return apiFetch(`/admin/gallery/${id}`, { method: "DELETE" });
}
