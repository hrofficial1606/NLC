import { apiFetch } from "./client";
import { uploadMedia as uploadMediaShared } from "./uploadApi";

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

/**
 * Uploads an image file to the active storage provider (Cloudinary when
 * configured, Supabase otherwise) and returns:
 *   { publicId, secureUrl, resourceType }
 *
 * Re-exported from uploadApi so the gallery page and the new member upload UI
 * share the same sanitized error path.
 */
export function uploadMedia(file, folder = "gallery") {
  return uploadMediaShared(file, folder);
}

export function deleteMedia(publicId) {
  return apiFetch(`/admin/uploads/${encodeURIComponent(publicId)}`, {
    method: "DELETE",
  });
}
