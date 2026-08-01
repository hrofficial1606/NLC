package com.nlc.backend.service.impl;

import com.nlc.backend.config.StorageProperties;
import com.nlc.backend.config.SupabaseStorageClient;
import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "SUPABASE", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService implements StorageService {

    private final SupabaseStorageClient client;
    private final StorageProperties storageProperties;

    @Override
    public StorageUploadResult uploadPublic(MultipartFile file, String folder, String objectKey) {
        String key = folder == null || folder.isBlank() ? objectKey : folder + "/" + objectKey;
        StorageUploadResult result = client.upload(file, storageProperties.getSupabase().getPublicBucket(), key);
        // Public bucket objects: also expose public URL for direct browser access.
        return new StorageUploadResult(
                result.objectKey(),
                client.publicUrl(storageProperties.getSupabase().getPublicBucket(), key),
                null,
                false
        );
    }

    @Override
    public StorageUploadResult uploadPrivate(MultipartFile file, String folder, String objectKey) {
        String key = folder == null || folder.isBlank() ? objectKey : folder + "/" + objectKey;
        return client.upload(file, storageProperties.getSupabase().getPrivateBucket(), key);
    }

    @Override
    public void delete(String bucket, String objectKey) {
        client.delete(bucket, objectKey);
    }

    @Override
    public String resolveViewUrl(String bucket, String objectKey) {
        if (PUBLIC_BUCKET.equals(bucket)) {
            return client.publicUrl(bucket, objectKey);
        }
        if (PRIVATE_BUCKET.equals(bucket)) {
            return client.createSignedUrl(bucket, objectKey);
        }
        throw new BadRequestException("Unknown bucket: " + bucket);
    }
}
