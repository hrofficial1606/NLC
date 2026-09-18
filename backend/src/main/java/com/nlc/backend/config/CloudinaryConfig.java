package com.nlc.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nlc.backend.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Cloudinary client bean — only registered when the active storage provider is
 * CLOUDINARY. The SDK is server-side only; the API secret is never exposed to
 * the frontend.
 *
 * <p>We read credentials directly from the Environment to ensure that system
 * environment variables (CLOUDINARY_CLOUD_NAME, etc.) are picked up reliably,
 * bypassing any potential binding issues with nested @ConfigurationProperties.</p>
 */
@Configuration
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "CLOUDINARY")
@Slf4j
public class CloudinaryConfig {

    @Autowired
    private Environment env;

    /**
     * Returns a configured {@link Cloudinary} client, or {@code null} when
     * credentials are missing.
     */
    @Bean
    public Cloudinary cloudinary() {
        String cloudName = env.getProperty("CLOUDINARY_CLOUD_NAME");
        String apiKey = env.getProperty("CLOUDINARY_API_KEY");
        String apiSecret = env.getProperty("CLOUDINARY_API_SECRET");

        if (cloudName == null || cloudName.isBlank()
                || apiKey == null || apiKey.isBlank()
                || apiSecret == null || apiSecret.isBlank()) {
            log.warn("Cloudinary storage is selected but credentials are missing. "
                    + "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET. "
                    + "Admin uploads will return HTTP 503 until credentials are configured; "
                    + "public read APIs are unaffected.");
            return null;
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
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
