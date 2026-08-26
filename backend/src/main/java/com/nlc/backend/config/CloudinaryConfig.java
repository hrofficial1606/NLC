package com.nlc.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nlc.backend.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary client bean — only registered when the active storage provider is
 * CLOUDINARY. The SDK is server-side only; the API secret is never exposed to
 * the frontend.
 *
 * <p>When {@code APP_STORAGE_PROVIDER=CLOUDINARY} is set but one or more
 * Cloudinary env vars are missing, the previous implementation threw at bean
 * creation and prevented the entire Spring Boot context from starting —
 * taking down the public read APIs with it. We now log a clear warning and
 * intentionally skip creating the {@link Cloudinary} bean. The admin upload
 * controller (which uses {@code ObjectProvider<MediaStorageService>}) detects
 * the missing bean and returns a clean 503 JSON error, while the public GET
 * APIs keep working normally.</p>
 *
 * <p>The {@code @Bean} method returns {@code null} when credentials are
 * missing. Returning {@code null} from a {@code @Bean} factory method is
 * explicitly supported by Spring's
 * {@code ConfigurationClassBeanDefinitionReader} — it simply skips bean
 * registration, so {@code @ConditionalOnBean(Cloudinary.class)} on
 * {@code CloudinaryStorageService} does not match, and
 * {@code ObjectProvider<MediaStorageService>} returns an empty optional.</p>
 */
@Configuration
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "CLOUDINARY")
@Slf4j
public class CloudinaryConfig {

    /**
     * Returns a configured {@link Cloudinary} client, or {@code null} when
     * credentials are missing.
     *
     * <p>Returning {@code null} from a {@code @Bean} factory is supported by
     * Spring — the framework simply skips bean registration, so
     * {@code ObjectProvider<MediaStorageService>} injection points see no
     * {@code CloudinaryStorageService} bean. This lets the Spring context start
     * successfully when Cloudinary is selected but unconfigured; the admin
     * upload endpoint then short-circuits with a clean 503 JSON instead of
     * taking down the entire backend.</p>
     */
    @Bean
    public Cloudinary cloudinary(StorageProperties storageProperties) {
        StorageProperties.Cloudinary cfg = storageProperties.getCloudinary();
        if (cfg.getCloudName() == null || cfg.getCloudName().isBlank()
                || cfg.getApiKey() == null || cfg.getApiKey().isBlank()
                || cfg.getApiSecret() == null || cfg.getApiSecret().isBlank()) {
            // Log loudly but DO NOT throw — failing here would prevent the
            // entire Spring Boot context from starting, which would also break
            // the public read endpoints. The admin upload endpoint will
            // surface a clear 503 JSON via ObjectProvider<MediaStorageService>.
            log.warn("Cloudinary storage is selected but credentials are missing. "
                    + "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET. "
                    + "Admin uploads will return HTTP 503 until credentials are configured; "
                    + "public read APIs are unaffected.");
            // Returning null causes Spring to skip bean registration. The
            // ObjectProvider in UploadController and CloudinaryStorageService
            // (also @ConditionalOnBean) will then see "no bean" and we
            // surface a clean 503 JSON instead of crashing the context.
            // This is documented Spring behavior — @Bean factory methods may
            // return null to indicate "do not register this bean".
            return null;
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
