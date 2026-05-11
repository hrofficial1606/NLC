package com.nlc.backend.dto.cms;

public record TeamMemberResponse(
        Long id,
        String name,
        String designation,
        String bio,
        String imageUrl,
        String instagramUrl,
        String facebookUrl,
        String linkedinUrl,
        Integer displayOrder
) {
}
