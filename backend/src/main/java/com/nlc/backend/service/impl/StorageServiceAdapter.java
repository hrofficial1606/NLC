package com.nlc.backend.service.impl;

import com.nlc.backend.dto.upload.MediaUploadResponse;
import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.service.MediaStorageService;
import com.nlc.backend.service.StorageService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Adapter that lets the legacy {@code /admin/uploads} controller (which talks
 * to {@link MediaStorageService}) still delegate to the SUPABASE-backed or
 * LOCAL-backed {@link StorageService}. Active when the configured
 * public-storage provider is SUPABASE or LOCAL (or the property is missing).
 * When CLOUDINARY is selected, the {@link CloudinaryStorageService} bean
 * provides the {@link MediaStorageService} implementation directly — and when
 * CLOUDINARY is selected without credentials the bean is intentionally absent
 * and the upload controller returns a clean 503 JSON.
 */
@Service
@ConditionalOnExpression(
        "'${app.storage.provider:SUPABASE}'.equalsIgnoreCase('SUPABASE') "
                + "or '${app.storage.provider:SUPABASE}'.equalsIgnoreCase('LOCAL')")
@RequiredArgsConstructor
public class StorageServiceAdapter implements MediaStorageService {

    private final StorageService storageService;

    @Override
    public MediaUploadResponse upload(MultipartFile file, String folder) {
        String objectKey = UUID.randomUUID().toString();
        StorageUploadResult result = storageService.uploadPublic(file, folder, objectKey);
        return new MediaUploadResponse(
                result.objectKey(),
                result.publicUrl() != null ? result.publicUrl() : "",
                "image"
        );
    }

    @Override
    public void delete(String publicId) {
        storageService.delete(StorageService.PUBLIC_BUCKET, publicId);
    }
}
