package com.nlc.backend.dto.cms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeamMemberRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 120) String designation,
        String bio,
        String imageUrl,
        String instagramUrl,
        String facebookUrl,
        String linkedinUrl,
        Integer displayOrder
) {
}
