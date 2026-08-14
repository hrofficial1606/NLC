package com.nlc.backend.dto.gallery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GalleryMediaRequest(
        @NotBlank @Size(max = 160) String title,
        @Size(max = 180) String category,
        @NotBlank String mediaUrl,
        String thumbnailUrl,
        @NotBlank String mediaType,
        /**
         * Optional. When the admin uploads via Cloudinary the controller
         * forwards the returned public_id here so the asset can later be
         * safely replaced or deleted. Null for external / manual URLs.
         */
        @Size(max = 500) String storagePublicId,
        /**
         * Optional. Identifies the underlying storage provider that owns the
         * asset so delete can be safely routed. Expected values: "CLOUDINARY",
         * "SUPABASE", or null/empty for external URLs.
         */
        @Size(max = 32) String storageProvider
) {
}
