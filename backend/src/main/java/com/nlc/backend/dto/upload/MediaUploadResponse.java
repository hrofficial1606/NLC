package com.nlc.backend.dto.upload;

public record MediaUploadResponse(
        String publicId,
        String secureUrl,
        String resourceType
) {
}
