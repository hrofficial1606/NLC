package com.nlc.backend.dto.gallery;

import java.time.LocalDateTime;

public record GalleryMediaResponse(
        Long id,
        String title,
        String category,
        String mediaUrl,
        String thumbnailUrl,
        String mediaType,
        String sourceType,
        boolean active,
        String storagePublicId,
        String storageProvider,
        LocalDateTime createdAt
) {
}
