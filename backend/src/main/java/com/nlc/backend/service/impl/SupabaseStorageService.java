package com.nlc.backend.service.impl;

import com.nlc.backend.config.StorageProperties;
import com.nlc.backend.config.SupabaseStorageClient;
import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Supabase-backed implementation of {@link StorageService}.
 *
 * <p>Marked as {@code @Primary} and loaded whenever the active public-storage
 * provider is SUPABASE or CLOUDINARY. This guarantees the existing
 * {@code BookingServiceImpl} injection of {@link StorageService} continues to
 * use Supabase for private payment screenshots regardless of the public
 * provider. The public bucket upload surface is
 * {@link com.nlc.backend.service.MediaStorageService}, implemented by
 * {@link StorageServiceAdapter} (SUPABASE) or {@link CloudinaryStorageService}
 * (CLOUDINARY).</p>
 *
 * <p>Payment screenshots remain private in Supabase. Cloudinary is only used
 * for public media (gallery, events, members, sponsors).</p>
 */
@Service
@Primary
@ConditionalOnExpression(
        "'${app.storage.provider:SUPABASE}'.equalsIgnoreCase('SUPABASE') "
                + "|| '${app.storage.provider:SUPABASE}'.equalsIgnoreCase('CLOUDINARY')")
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
