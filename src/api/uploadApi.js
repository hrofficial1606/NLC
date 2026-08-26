import { apiFetch } from "./client";

/**
 * Uploads a single image to the admin upload endpoint and returns
 *   { publicId, secureUrl, resourceType }.
 *
 * `folder` must be one of the allowed backend values: "gallery", "events",
 * "members", "sponsors" (or "nlc"). The backend routes to Cloudinary when
 * APP_STORAGE_PROVIDER=CLOUDINARY, otherwise Supabase.
 *
 * Any proxy/server failure is translated into a clean user-facing message —
 * raw HTML (e.g. a 502 from an upstream nginx) is never surfaced.
 */
export async function uploadMedia(file, folder = "gallery") {
  const form = new FormData();
  form.append("file", file);
  try {
    return await apiFetch(`/admin/uploads?folder=${encodeURIComponent(folder)}`, {
      method: "POST",
      body: form,
      isForm: true,
    });
  } catch (err) {
    const fallback = "Image upload failed. Please try again or contact the administrator.";
    if (!err.message || /<html|<!doctype/i.test(err.message) || /Request failed/i.test(err.message)) {
      err.message = fallback;
    }
    throw err;
  }
}
