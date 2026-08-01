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
     * Active provider. SUPABASE is the target per Phase 2 spec.
     * CLOUDINARY is kept as a fallback so existing deployments still work
     * until Supabase credentials are configured.
     */
    private StorageProvider provider = StorageProvider.SUPABASE;

    private final Supabase supabase = new Supabase();

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
}
