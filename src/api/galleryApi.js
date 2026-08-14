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

/**
 * Uploads an image file to the active storage provider (Cloudinary when
 * configured, Supabase otherwise) and returns:
 *   { publicId, secureUrl, resourceType }
 *
 * The response shape is unified regardless of provider so the admin UI can
 * forward the values straight to createGalleryItem. Folder is one of:
 * "gallery", "events", "members", "sponsors".
 */
export async function uploadMedia(file, folder = "gallery") {
  const form = new FormData();
  form.append("file", file);
  return apiFetch(`/admin/uploads?folder=${encodeURIComponent(folder)}`, {
    method: "POST",
    body: form,
    isForm: true,
  });
}

export function deleteMedia(publicId) {
  return apiFetch(`/admin/uploads/${encodeURIComponent(publicId)}`, {
    method: "DELETE",
  });
}
