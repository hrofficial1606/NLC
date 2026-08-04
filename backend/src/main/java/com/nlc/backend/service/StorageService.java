package com.nlc.backend.service;

import com.nlc.backend.dto.upload.StorageUploadResult;
import org.springframework.web.multipart.MultipartFile;

/**
 * Backend-agnostic storage operations used by application services.
 *
 * Semantic buckets:
 *   - PUBLIC_BUCKET (nlc-public):  event images, event QRs, gallery, members
 *   - PRIVATE_BUCKET (nlc-private): payment screenshots
 *
 * The current implementation delegates to {@link com.nlc.backend.config.SupabaseStorageClient}.
 */
public interface StorageService {

    String PUBLIC_BUCKET = "nlc-public";
    String PRIVATE_BUCKET = "nlc-private";

    StorageUploadResult uploadPublic(MultipartFile file, String folder, String objectKey);

    StorageUploadResult uploadPrivate(MultipartFile file, String folder, String objectKey);

    void delete(String bucket, String objectKey);

    /**
     * For private bucket items, returns a short-lived signed URL the admin can
     * use to view a payment proof. Returns null for public bucket.
     */
    String resolveViewUrl(String bucket, String objectKey);
}
