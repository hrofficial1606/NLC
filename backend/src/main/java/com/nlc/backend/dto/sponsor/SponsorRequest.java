package com.nlc.backend.dto.sponsor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SponsorRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 180) String slug,
        @NotBlank @Size(max = 600) String logoUrl,
        @Size(max = 255) String websiteUrl,
        @Size(max = 180) String category,
        String description,
        @NotNull Integer displayOrder,
        boolean active
) {
}
