package com.nlc.backend.dto.cms;

public record AboutContentResponse(
        Long id,
        String sectionKey,
        String title,
        String content,
        String imageUrl,
        boolean active
) {
}
