package com.nlc.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nlc.backend.exception.BadRequestException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary client bean — only registered when the active storage provider is
 * CLOUDINARY. The SDK is server-side only; the API secret is never exposed to
 * the frontend.
 */
@Configuration
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "CLOUDINARY")
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(StorageProperties storageProperties) {
        StorageProperties.Cloudinary cfg = storageProperties.getCloudinary();
        if (cfg.getCloudName() == null || cfg.getCloudName().isBlank()
                || cfg.getApiKey() == null || cfg.getApiKey().isBlank()
                || cfg.getApiSecret() == null || cfg.getApiSecret().isBlank()) {
            throw new IllegalStateException(
                    "Cloudinary storage is selected but credentials are missing. "
                            + "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cfg.getCloudName(),
                "api_key", cfg.getApiKey(),
                "api_secret", cfg.getApiSecret(),
                "secure", true
        ));
    }

    /**
     * Validates and normalizes a folder input from the admin upload controller.
     * Rejects path traversal attempts and unknown values. Returns a folder
     * key that can be safely used as a Cloudinary folder path.
     */
    public static String resolveFolder(StorageProperties.Cloudinary cfg, String folder) {
        if (folder == null || folder.isBlank()) {
            return cfg.getBaseFolder() == null ? "nlc" : cfg.getBaseFolder();
        }
        String normalized = folder.trim().toLowerCase().replaceAll("^/+", "").replaceAll("/+$", "");
        if (normalized.contains("..") || normalized.startsWith("/")
                || normalized.contains("\0")) {
            throw new BadRequestException("Invalid folder");
        }
        return switch (normalized) {
            case "gallery", "nlc/gallery" -> cfg.getGalleryFolder();
            case "events", "nlc/events" -> cfg.getEventsFolder();
            case "members", "nlc/members" -> cfg.getMembersFolder();
            case "sponsors", "nlc/sponsors" -> cfg.getSponsorsFolder();
            case "nlc" -> cfg.getBaseFolder();
            default -> throw new BadRequestException("Unsupported folder: " + folder);
        };
    }
}
