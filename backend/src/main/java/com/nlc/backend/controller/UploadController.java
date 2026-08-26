package com.nlc.backend.controller;

import com.nlc.backend.config.StorageProperties;
import com.nlc.backend.config.StorageProvider;
import com.nlc.backend.dto.common.ApiResponse;
import com.nlc.backend.dto.upload.MediaUploadResponse;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.service.MediaStorageService;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Admin-only media upload endpoint. Used by the public media surfaces
 * (gallery, events, members, sponsors) when CLOUDINARY is the active public
 * provider. Private payment screenshots are NOT uploaded here — they go
 * through the booking flow which routes to the Supabase private bucket.
 */
@RestController
@RequestMapping("/admin/uploads")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UploadController {

    private static final long DEFAULT_MAX_BYTES = 10L * 1024L * 1024L;
    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final Set<String> ALLOWED_FOLDERS = Set.of(
            "gallery", "events", "members", "sponsors", "nlc"
    );

    /**
     * {@link MediaStorageService} is provided by CloudinaryStorageService when
     * APP_STORAGE_PROVIDER=CLOUDINARY, or by StorageServiceAdapter when SUPABASE.
     * Using ObjectProvider means the controller can boot even when the
     * configured provider is CLOUDINARY but credentials are missing — instead
     * we surface a clear 503 JSON error at request time.
     */
    private final ObjectProvider<MediaStorageService> mediaStorageServiceProvider;
    private final StorageProperties storageProperties;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaUploadResponse>> upload(@RequestParam("file") MultipartFile file,
                                                   @RequestParam(defaultValue = "nlc") String folder) {
        validateFile(file);
        String safeFolder = sanitizeFolder(folder);
        MediaStorageService mediaStorageService = mediaStorageServiceProvider.getIfAvailable();
        if (mediaStorageService == null) {
            // Cloudinary provider is selected but the Cloudinary bean could not
            // be created (typically missing credentials) — or no provider is
            // configured. Return a clear, actionable JSON error rather than a
            // raw 500/502 that the upstream proxy would render as HTML.
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.failure(cloudinaryConfigMessage(), null));
        }
        MediaUploadResponse result = mediaStorageService.upload(file, safeFolder);
        return ResponseEntity.ok(ApiResponse.success("Media uploaded", result));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String publicId) {
        if (publicId == null || publicId.isBlank() || publicId.contains("..")) {
            throw new BadRequestException("Invalid publicId");
        }
        MediaStorageService mediaStorageService = mediaStorageServiceProvider.getIfAvailable();
        if (mediaStorageService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.failure(cloudinaryConfigMessage(), null));
        }
        mediaStorageService.delete(publicId);
        return ResponseEntity.ok(ApiResponse.success("Media deleted", null));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        if (file.getSize() > DEFAULT_MAX_BYTES) {
            throw new BadRequestException("File too large (max 10MB)");
        }
        String mime = file.getContentType();
        if (mime == null || !ALLOWED_MIME.contains(mime.toLowerCase())) {
            throw new BadRequestException("Unsupported file type: " + mime);
        }
        String name = file.getOriginalFilename();
        if (name != null) {
            String lower = name.toLowerCase();
            if (lower.endsWith(".svg") || lower.endsWith(".html") || lower.endsWith(".htm")
                    || lower.endsWith(".exe") || lower.endsWith(".js")
                    || lower.endsWith(".php") || lower.endsWith(".jsp")
                    || lower.endsWith(".asp") || lower.endsWith(".aspx")) {
                throw new BadRequestException("Unsupported file extension: " + name);
            }
        }
    }

    private String sanitizeFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            return "nlc";
        }
        String trimmed = folder.trim().toLowerCase().replaceAll("^/+", "").replaceAll("/+$", "");
        if (trimmed.contains("..") || trimmed.contains("\0") || trimmed.startsWith("/")) {
            throw new BadRequestException("Invalid folder");
        }
        if (!ALLOWED_FOLDERS.contains(trimmed)) {
            throw new BadRequestException("Unsupported folder: " + folder);
        }
        return trimmed;
    }

    private String cloudinaryConfigMessage() {
        StorageProvider provider = storageProperties.getProvider();
        if (provider == StorageProvider.CLOUDINARY) {
            return "Image upload is currently unavailable: Cloudinary storage is selected "
                    + "but credentials are missing. Set CLOUDINARY_CLOUD_NAME, "
                    + "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the backend.";
        }
        return "Image upload is currently unavailable. Please contact the administrator.";
    }
}
