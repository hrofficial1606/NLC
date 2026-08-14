package com.nlc.backend.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /**
     * Active provider. SUPABASE is the default for private payment screenshots
     * and the public bucket. CLOUDINARY is supported as an additional provider
     * for public media (gallery, events, members, sponsors) and is selected
     * via app.storage.provider.
     */
    private StorageProvider provider = StorageProvider.SUPABASE;

    private final Supabase supabase = new Supabase();
    private final Cloudinary cloudinary = new Cloudinary();

    @Getter
    @Setter
    public static class Supabase {
        @NotBlank
        private String url;
        @NotBlank
        private String serviceRoleKey;
        private String publicBucket = "nlc-public";
        private String privateBucket = "nlc-private";
        private int signedUrlTtlSeconds = 300;
    }

    /**
     * Cloudinary credentials and folder configuration. Only used when
     * {@code app.storage.provider} is CLOUDINARY. The API secret must never
     * leave the backend — the SDK is invoked server-side only.
     */
    @Getter
    @Setter
    public static class Cloudinary {
        private String cloudName;
        private String apiKey;
        private String apiSecret;
        /** Secure HTTPS URL prefix to use for delivery. */
        private String secureBaseUrl;
        /** Folder under which public media (gallery, events, etc.) is stored. */
        private String baseFolder = "nlc";
        private String galleryFolder = "nlc/gallery";
        private String eventsFolder = "nlc/events";
        private String membersFolder = "nlc/members";
        private String sponsorsFolder = "nlc/sponsors";
        /** Max upload size in bytes (default 10MB). */
        private long maxBytes = 10L * 1024L * 1024L;
    }
}
