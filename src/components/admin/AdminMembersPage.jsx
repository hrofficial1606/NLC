import { useEffect, useRef, useState } from "react";
import { memberApi, uploadApi } from "../../api";

const empty = {
  name: "",
  designation: "",
  bio: "",
  imageUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  linkedinUrl: "",
  displayOrder: 0,
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_BYTES = 10 * 1024 * 1024;

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

export default function AdminMembersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  // Upload state for the modal — mirrors AdminGalleryPage for consistency.
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
      const data = await memberApi.listAdminTeam();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load members");
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

  function startCreate() {
    setEditing("new");
    setForm({ ...empty });
    resetUploadState();
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({ ...empty, ...item });
    resetUploadState();
    // Pre-seed upload state if the existing record was an admin upload
    // (Cloudinary/Supabase URL returned from the upload endpoint) so the
    // admin can see the current photo and "Replace" it.
    if (item.imageUrl) {
      setUploaded({ publicId: "", secureUrl: item.imageUrl });
    }
  }

  function closeModal() {
    setEditing(null);
    resetUploadState();
  }

  function update(field) {
    return (e) => {
      const v = e.target.type === "number" ? Number(e.target.value) : e.target.value;
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
      const res = await uploadApi.uploadMedia(selectedFile, "members");
      // Response: { publicId, secureUrl, resourceType }
      setUploaded(res);
    } catch (err) {
      const fallback = "Image upload failed. Please try again or contact the administrator.";
      let msg = err?.message || fallback;
      if (/<html|<!doctype/i.test(msg)) msg = fallback;
      setUploadError(msg);
      if (typeof console !== "undefined" && console.error) {
        console.error("Member upload failed", err);
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
      // Resolve the final imageUrl from the upload/URL state.
      let imageUrl = form.imageUrl;
      if (useUrlInstead) {
        if (!manualUrl) {
          setError("Please paste an image URL or disable the URL mode.");
          setSaving(false);
          return;
        }
        imageUrl = manualUrl;
      } else if (uploaded) {
        imageUrl = uploaded.secureUrl;
      }
      // If admin has not touched the image block at all in an edit, keep the
      // existing imageUrl (backward compatibility with previously stored URLs).

      const payload = { ...form, displayOrder: Number(form.displayOrder || 0), imageUrl };
      if (editing === "new") {
        await memberApi.createTeamMember(payload);
      } else {
        await memberApi.updateTeamMember(editing, payload);
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
    if (!window.confirm(`Delete member "${item.name}"?`)) return;
    try {
      await memberApi.deleteTeamMember(item.id);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  // The image preview shown in the modal: local object URL if a file was
  // selected, then the Cloudinary/Supabase URL once upload completes, then
  // any existing URL in edit mode.
  const previewSrc = localPreview || (uploaded && uploaded.secureUrl) || (editing && editing !== "new" ? form.imageUrl : "") || "";

  return (
    <section className="admin-page">
      <header className="admin-page__head">
        <h1>Members</h1>
        <button type="button" className="btn btn-primary" onClick={startCreate}>+ Add member</button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="page-loading">Loading…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state"><p>No team members yet.</p></div>
      ) : null}

      <div className="members-admin-grid">
        {items.map((m) => (
          <article key={m.id} className="member-admin-card">
            <div className="member-admin-card__photo">
              {m.imageUrl ? <img src={m.imageUrl} alt={m.name} /> : <div className="member-admin-card__placeholder" />}
            </div>
            <div className="member-admin-card__body">
              <h3>{m.name}</h3>
              <p className="muted">{m.designation}</p>
              <div className="member-admin-card__actions">
                <button type="button" className="btn btn-outline" onClick={() => startEdit(m)}>Edit</button>
                <button type="button" className="btn btn-danger" onClick={() => remove(m)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing === "new" ? "Add member" : "Edit member"}</h2>
            <form onSubmit={save} className="admin-form">
              <label>Name<input value={form.name} onChange={update("name")} required /></label>
              <label>Designation<input value={form.designation} onChange={update("designation")} required /></label>

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

              <label>Bio<textarea rows={3} value={form.bio} onChange={update("bio")} /></label>
              <div className="admin-form__row">
                <label>Instagram<input value={form.instagramUrl} onChange={update("instagramUrl")} /></label>
                <label>Facebook<input value={form.facebookUrl} onChange={update("facebookUrl")} /></label>
              </div>
              <div className="admin-form__row">
                <label>LinkedIn<input value={form.linkedinUrl} onChange={update("linkedinUrl")} /></label>
                <label>Display order<input type="number" value={form.displayOrder} onChange={update("displayOrder")} /></label>
              </div>
              <div className="admin-form__actions">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={saving || uploading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
