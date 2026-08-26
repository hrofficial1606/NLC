import { useEffect, useMemo, useRef, useState } from "react";
import { galleryApi } from "../../api";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_BYTES = 10 * 1024 * 1024;

const empty = {
  title: "",
  category: "",
  mediaUrl: "",
  thumbnailUrl: "",
  mediaType: "IMAGE",
  sourceType: "UPLOAD",
  active: true,
  storagePublicId: "",
  storageProvider: "",
};

function validateFile(file) {
  if (!file) return "Please choose an image file.";
  if (file.size > MAX_BYTES) {
    return `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max ${MAX_BYTES / (1024 * 1024)} MB.`;
  }
  const mime = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const okMime = ALLOWED_MIME.includes(mime);
  const okExt = ALLOWED_EXT.some((ext) => name.endsWith(ext));
  if (!okMime && !okExt) {
    return "Unsupported file. Please upload a JPG, PNG, or WEBP image.";
  }
  return null;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  // Upload state for the modal.
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState("");
  const [uploaded, setUploaded] = useState(null); // { publicId, secureUrl }
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [fileError, setFileError] = useState("");
  const [useUrlInstead, setUseUrlInstead] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef(null);

  async function load() {
    try {
      setLoading(true);
      const data = await galleryApi.listAdminGallery({ page: 0, size: 50 });
      const list = data?.content || (Array.isArray(data) ? data : []);
      setItems(list);
    } catch (err) {
      setError(err.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Revoke object URLs when preview changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function startCreate() {
    setEditing("new");
    setForm({ ...empty });
    resetUploadState();
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({ ...empty, ...item, storagePublicId: item.storagePublicId || "", storageProvider: item.storageProvider || "" });
    resetUploadState();
    // Pre-seed upload state if the existing record was a Cloudinary upload so
    // the admin sees the current image and can "Replace" it.
    if (item.storagePublicId && item.mediaUrl) {
      setUploaded({ publicId: item.storagePublicId, secureUrl: item.mediaUrl });
    }
  }

  function resetUploadState() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setSelectedFile(null);
    setLocalPreview("");
    setUploaded(null);
    setUploading(false);
    setUploadError("");
    setFileError("");
    setUseUrlInstead(false);
    setManualUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function closeModal() {
    setEditing(null);
    resetUploadState();
  }

  function update(field) {
    return (e) => {
      const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: v }));
    };
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) {
      setSelectedFile(null);
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview("");
      return;
    }
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (localPreview) URL.revokeObjectURL(localPreview);
    setSelectedFile(file);
    setLocalPreview(URL.createObjectURL(file));
    // Clear any prior upload because the new file hasn't been uploaded yet.
    setUploaded(null);
    setUploadError("");
  }

  async function handleUpload() {
    if (!selectedFile) {
      setFileError("Please choose an image first.");
      return;
    }
    if (uploading) return; // prevent duplicate uploads
    setUploading(true);
    setUploadError("");
    try {
      const res = await galleryApi.uploadMedia(selectedFile, "gallery");
      // Response: { publicId, secureUrl, resourceType }
      setUploaded(res);
    } catch (err) {
      // Defensive: ensure no raw HTML/502 ever reaches the admin UI.
      const fallback = "Image upload failed. Please try again or contact the administrator.";
      let msg = err?.message || fallback;
      if (/<html|<!doctype/i.test(msg)) msg = fallback;
      setUploadError(msg);
      // Log the technical response for debugging without showing it.
      if (typeof console !== "undefined" && console.error) {
        console.error("Gallery upload failed", err);
      }
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveSelected() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setSelectedFile(null);
    setLocalPreview("");
    setUploaded(null);
    setUploadError("");
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleUseUrlToggle() {
    setUseUrlInstead((v) => {
      const next = !v;
      if (next) {
        // Switching to manual URL — clear any pending upload.
        handleRemoveSelected();
      }
      return next;
    });
  }

  async function save(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      // Resolve the final mediaUrl + storage metadata to send.
      let mediaUrl = form.mediaUrl;
      let thumbnailUrl = form.thumbnailUrl || form.mediaUrl;
      let storagePublicId = form.storagePublicId || "";
      let storageProvider = form.storageProvider || "";

      if (useUrlInstead) {
        if (!manualUrl) {
          setError("Please paste an image URL or disable the URL mode.");
          setSaving(false);
          return;
        }
        mediaUrl = manualUrl;
        thumbnailUrl = manualUrl;
        storagePublicId = "";
        storageProvider = "";
      } else if (uploaded) {
        // The Cloudinary / Supabase upload finished — use those values.
        mediaUrl = uploaded.secureUrl;
        thumbnailUrl = uploaded.secureUrl;
        storagePublicId = uploaded.publicId || "";
        // The active provider is whichever the backend used; the backend
        // already routed through Cloudinary or Supabase. We mark it as
        // CLOUDINARY when the URL looks like res.cloudinary.com, otherwise
        // SUPABASE. This is best-effort metadata for the admin UI / future
        // replacement operations.
        storageProvider = (uploaded.secureUrl || "").includes("res.cloudinary.com")
          ? "CLOUDINARY"
          : "SUPABASE";
      } else if (editing === "new") {
        setError("Please upload an image or enable the URL mode before saving.");
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title,
        category: form.category,
        mediaUrl,
        thumbnailUrl,
        mediaType: form.mediaType,
        storagePublicId,
        storageProvider,
      };

      if (editing === "new") {
        await galleryApi.createGalleryItem(payload);
      } else {
        await galleryApi.updateGalleryItem(editing, payload);
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete gallery item "${item.title}"?`)) return;
    try {
      await galleryApi.deleteGalleryItem(item.id);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  const modalTitle = useMemo(
    () => (editing === "new" ? "Add gallery item" : "Edit gallery item"),
    [editing]
  );

  // The image preview shown in the modal: local object URL if a file was
  // selected, then the Cloudinary/Supabase URL once upload completes, then
  // any existing URL in edit mode.
  const previewSrc = useMemo(() => {
    if (localPreview) return localPreview;
    if (uploaded?.secureUrl) return uploaded.secureUrl;
    if (editing && editing !== "new" && form.mediaUrl) return form.mediaUrl;
    return "";
  }, [localPreview, uploaded, editing, form.mediaUrl]);

  const canSave = useMemo(() => {
    if (saving || uploading) return false;
    if (!form.title) return false;
    if (useUrlInstead) return !!manualUrl;
    if (uploaded) return true;
    if (editing && editing !== "new" && form.mediaUrl) return true;
    return false;
  }, [saving, uploading, form.title, useUrlInstead, manualUrl, uploaded, editing, form.mediaUrl]);

  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <h1>Gallery</h1>
        <button type="button" className="btn btn-primary" onClick={startCreate}>+ Add image</button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state"><p>No gallery images yet.</p></div>
      ) : null}

      <div className="gallery-admin-grid">
        {items.map((item) => (
          <article key={item.id} className="gallery-admin-card">
            <div className="gallery-admin-card__media">
              {item.thumbnailUrl || item.mediaUrl ? (
                <img src={item.thumbnailUrl || item.mediaUrl} alt={item.title} loading="lazy" />
              ) : (
                <div className="gallery-admin-card__placeholder" />
              )}
            </div>
            <div className="gallery-admin-card__body">
              <h3>{item.title || "Untitled"}</h3>
              <p className="muted">{item.category || "—"}</p>
              <div className="gallery-admin-card__actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(item)}>Edit</button>
                <button type="button" className="btn btn-danger" onClick={() => remove(item)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modalTitle}</h2>
            <form onSubmit={save} className="admin-form">
              <label>Title<input value={form.title} onChange={update("title")} required /></label>
              <label>Category<input value={form.category} onChange={update("category")} /></label>

              <fieldset className="admin-form__field">
                <legend>Image</legend>

                {!useUrlInstead ? (
                  <>
                    <div className="admin-form__row">
                      <label className="admin-form__file">
                        <span>Select image</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                          onChange={handleFileChange}
                          disabled={uploading || saving}
                        />
                      </label>
                    </div>

                    {fileError ? <div className="alert alert-error">{fileError}</div> : null}

                    {previewSrc ? (
                      <div className="admin-form__preview">
                        <img src={previewSrc} alt="Selected preview" />
                        {uploading ? <div className="admin-form__preview-overlay">Uploading…</div> : null}
                      </div>
                    ) : null}

                    <div className="admin-form__row">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading || !!uploaded}
                      >
                        {uploading ? "Uploading…" : uploaded ? "Uploaded ✓" : "Upload Image"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleRemoveSelected}
                        disabled={!selectedFile || uploading}
                      >
                        Remove selected
                      </button>
                    </div>

                    {uploadError ? <div className="alert alert-error">{uploadError}</div> : null}

                    {uploaded ? (
                      <p className="muted small">
                        Uploaded. URL and storage id are ready to save.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <label>Image URL<input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="https://…" /></label>
                    {manualUrl ? (
                      <div className="admin-form__preview">
                        <img src={manualUrl} alt="Manual URL preview" />
                      </div>
                    ) : null}
                  </>
                )}

                <label className="check">
                  <input type="checkbox" checked={useUrlInstead} onChange={handleUseUrlToggle} />
                  Use image URL instead (advanced)
                </label>
              </fieldset>

              <div className="admin-form__row">
                <label>Type
                  <select value={form.mediaType} onChange={update("mediaType")}>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </label>
                <label className="check"><input type="checkbox" checked={form.active} onChange={update("active")} /> Active</label>
              </div>

              <div className="admin-form__actions">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={saving || uploading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!canSave}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
