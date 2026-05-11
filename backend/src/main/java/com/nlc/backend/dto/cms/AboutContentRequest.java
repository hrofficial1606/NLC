package com.nlc.backend.dto.cms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AboutContentRequest(
        @NotBlank @Size(max = 160) String sectionKey,
        @NotBlank @Size(max = 160) String title,
        @NotBlank String content,
        String imageUrl,
        boolean active
) {
}
