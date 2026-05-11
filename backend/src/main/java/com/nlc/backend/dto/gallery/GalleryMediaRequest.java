package com.nlc.backend.dto.gallery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GalleryMediaRequest(
        @NotBlank @Size(max = 160) String title,
        @Size(max = 180) String category,
        @NotBlank String mediaUrl,
        String thumbnailUrl,
        @NotBlank String mediaType
) {
}
