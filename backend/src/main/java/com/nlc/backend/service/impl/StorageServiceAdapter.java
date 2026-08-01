package com.nlc.backend.service.impl;

import com.nlc.backend.dto.upload.MediaUploadResponse;
import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.service.MediaStorageService;
import com.nlc.backend.service.StorageService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Adapter that lets legacy code (UploadController) still talk to the new
 * backend-agnostic {@link StorageService}. Will be merged into a single service
 * once the old controller surface is consolidated.
 */
@Service
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
