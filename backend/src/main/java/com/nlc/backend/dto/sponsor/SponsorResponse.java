package com.nlc.backend.dto.sponsor;

import java.time.LocalDateTime;

public record SponsorResponse(
        Long id,
        String name,
        String slug,
        String logoUrl,
        String websiteUrl,
        String category,
        String description,
        Integer displayOrder,
        boolean active,
        LocalDateTime createdAt
) {
}
