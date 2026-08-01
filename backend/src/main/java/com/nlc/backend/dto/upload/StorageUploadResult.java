package com.nlc.backend.dto.upload;

public record StorageUploadResult(
        String objectKey,
        String publicUrl,
        String signedUrl,
        boolean privateAccess
) {
}
