package com.nlc.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nlc.backend.config.CloudinaryConfig;
import com.nlc.backend.config.StorageProperties;
import com.nlc.backend.dto.upload.MediaUploadResponse;
import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.service.MediaStorageService;
import com.nlc.backend.service.StorageService;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Cloudinary-backed storage provider. Used for PUBLIC media (gallery, events,
 * members, sponsors). Private payment screenshots continue to live in Supabase;
 * the booking flow still uses {@link SupabaseStorageService} directly for the
 * private bucket.
 *
 * "Public ID" in Cloudinary is equivalent to the Supabase "object key" — it
 * uniquely identifies the asset so it can be deleted later.
 */
@Service
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "CLOUDINARY")
@ConditionalOnBean(Cloudinary.class)
@RequiredArgsConstructor
@Slf4j
public class CloudinaryStorageService implements StorageService, MediaStorageService, DisposableBean {

    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long DEFAULT_MAX_BYTES = 10L * 1024L * 1024L;
    /**
     * Cloudinary HTTP calls are synchronous and can hang for tens of seconds
     * when the Cloudinary API is slow or unreachable. We bound each upload with
     * a hard timeout so a stuck upload can never exceed nginx's
     * {@code proxy_read_timeout} (default 60s) and surface as a 502 Bad
     * Gateway to the admin browser. A bounded timeout also guarantees the
     * request returns a clean JSON error instead of an open socket that
     * Tomcat eventually resets.
     */
    private static final long UPLOAD_TIMEOUT_SECONDS = 25L;

    /**
     * Single-thread executor used to enforce the upload timeout. Sized to 1
     * because uploads are user-driven (one at a time per admin) and the
     * Cloudinary SDK is not thread-safe across uploads in the same process.
     */
    private final ExecutorService uploadExecutor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "cloudinary-upload");
        t.setDaemon(true);
        return t;
    });

    private final Cloudinary cloudinary;
    private final StorageProperties storageProperties;

    // ===== StorageService (bucket abstraction, used by feature services) =====

    @Override
    public StorageUploadResult uploadPublic(MultipartFile file, String folder, String objectKey) {
        validateImage(file);
        String safeFolder = CloudinaryConfig.resolveFolder(storageProperties.getCloudinary(), folder);
        // Cloudinary public_id accepts '/' for folder structure; we use the
        // generated UUID as the public_id under the safe folder.
        String publicId = safeFolder + "/" + objectKey;
        byte[] payload;
        try {
            payload = file.getBytes();
        } catch (IOException ex) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Could not read uploaded file: " + ex.getMessage());
        }
        Future<Map<?, ?>> future = uploadExecutor.submit((Callable<Map<?, ?>>) () ->
                cloudinary.uploader().upload(payload, ObjectUtils.asMap(
                        "public_id", publicId,
                        "resource_type", "image",
                        "overwrite", true,
                        "unique_filename", false,
                        "use_filename", false,
                        "folder", safeFolder
                )));
        try {
            Map<?, ?> result = future.get(UPLOAD_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            String secureUrl = asString(result.get("secure_url"));
            String returnedPublicId = asString(result.get("public_id"));
            return new StorageUploadResult(returnedPublicId, secureUrl, null, false);
        } catch (TimeoutException ex) {
            // Cancel the stuck future so the executor thread can be reused.
            future.cancel(true);
            log.error("Cloudinary upload timed out after {}s for publicId={}", UPLOAD_TIMEOUT_SECONDS, publicId);
            throw new IllegalStateException(
                    "Cloudinary upload timed out after " + UPLOAD_TIMEOUT_SECONDS + "s. "
                            + "Please retry or contact the administrator.", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Cloudinary upload interrupted", ex);
        } catch (java.util.concurrent.ExecutionException ex) {
            // Unwrap the underlying Cloudinary SDK failure so the message
            // reflects the real reason (bad credentials, network, etc.) and
            // the GlobalExceptionHandler can surface a clean 503 JSON.
            Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
            log.error("Cloudinary upload failed for publicId={}: {}", publicId, cause.getMessage());
            throw new IllegalStateException("Cloudinary upload failed: " + cause.getMessage(), cause);
        }
    }

    @Override
    public void destroy() {
        // Gracefully shut down the single-thread upload executor on context
        // shutdown so the JVM can exit cleanly during redeploys/restarts.
        uploadExecutor.shutdownNow();
    }

    /**
     * Cloudinary is NOT used for private payment screenshots. Booking flow
     * calls this directly with the Supabase private bucket. When the active
     * provider is CLOUDINARY, this implementation refuses and the booking
     * service should be configured to use Supabase for private storage.
     */
    @Override
    public StorageUploadResult uploadPrivate(MultipartFile file, String folder, String objectKey) {
        throw new BadRequestException(
                "Cloudinary is not used for private payment screenshots. "
                        + "Private storage remains on Supabase.");
    }

    @Override
    public void delete(String bucket, String objectKey) {
        // For Cloudinary, the "objectKey" is actually the public_id; we ignore
        // the bucket (Cloudinary has a single namespace per resource type) and
        // attempt to delete using image resource type.
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(objectKey, ObjectUtils.asMap(
                    "resource_type", "image",
                    "invalidate", true
            ));
            log.debug("Cloudinary delete result for {}: {}", objectKey, result.get("result"));
        } catch (Exception ex) {
            log.warn("Cloudinary delete error for {}: {}", objectKey, ex.getMessage());
        }
    }

    @Override
    public String resolveViewUrl(String bucket, String objectKey) {
        // Cloudinary assets are accessed via their public HTTPS URL; for the
        // public bucket we simply return the secure_url, but here we just
        // expect the caller to pass the secure_url directly. Returning null
        // signals that the stored mediaUrl should be used.
        return null;
    }

    // ===== MediaStorageService (admin upload controller) =====

    @Override
    public MediaUploadResponse upload(MultipartFile file, String folder) {
        String objectKey = UUID.randomUUID().toString();
        StorageUploadResult result = uploadPublic(file, folder, objectKey);
        return new MediaUploadResponse(
                result.objectKey(),
                result.publicUrl() != null ? result.publicUrl() : "",
                "image"
        );
    }

    @Override
    public void delete(String publicId) {
        // publicId here is the Cloudinary public_id; route through the bucket
        // overload with the public bucket marker.
        delete(PUBLIC_BUCKET, publicId);
    }

    // ===== helpers =====

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        String mime = file.getContentType();
        if (mime == null || !ALLOWED_MIME.contains(mime.toLowerCase())) {
            throw new BadRequestException("Unsupported file type: " + mime);
        }
        long maxBytes = storageProperties.getCloudinary().getMaxBytes() > 0
                ? storageProperties.getCloudinary().getMaxBytes()
                : DEFAULT_MAX_BYTES;
        if (file.getSize() > maxBytes) {
            throw new BadRequestException("File too large (max " + (maxBytes / (1024 * 1024)) + "MB)");
        }
        // Defense-in-depth: also reject suspicious filenames and SVG.
        String name = file.getOriginalFilename();
        if (name != null) {
            String lower = name.toLowerCase();
            if (lower.endsWith(".svg") || lower.endsWith(".html") || lower.endsWith(".htm")
                    || lower.endsWith(".exe") || lower.endsWith(".js")
                    || lower.endsWith(".php") || lower.endsWith(".jsp")) {
                throw new BadRequestException("Unsupported file extension: " + name);
            }
        }
    }

    private static String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
